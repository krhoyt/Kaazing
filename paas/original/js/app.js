// Parse keys
var APPLICATION_ID = "ZBzdcXEpxqTcaig69vOIHhjw5OQ36SLzsWpOHhK8";
var JAVASCRIPT_KEY = "Xt3X8AETCP7thbIjPk6SJKAcC8hPx0CPQZi7eIPw";

// Global variable for Parse object
var Account;

// Global variables describing if the registration can go ahead
// Matching passwords entered in the field & is encrypted successfully
var pwChecked    = false;
// Email provided during registration hasn't been used before
var emailChecked = false

var encryptedPw;

// Connecting to Parse
Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY);

$(() => {
  // Debugging
  // Optional "debug" parameter on the query string
  if( !URLParser( window.location.href ).hasParam( "debug" ) )
  {
    debug = false;
    console.log( "Add query variable \"debug\" to see messages." );
  } else {
    debug = true;
  }

  //Initializing Parse by subclassing the Parse Object
  Account = Parse.Object.extend("Account");

  // Registration form submit event handler
  $('#registerForm').on('submit', e => {
    e.preventDefault();

    // Make sure that the passwords match
    var pwMatch;
    ($("#registrationPassword").val() === $("#registrationPassword2").val() ? pwMatch=true : pwMatch=false);
    if (pwMatch) {
    // Upon form submission, we encrypt the password
      if (debug) {
        console.log ('Registration form filled out OK.');
      }
      crypt ($("#registrationPassword").val(), registerCryptCallback);
    }
    else {
      $("#pw-error").removeClass("collapse");
      if (debug) {
        console.log ('Passwords do not match.');
      }
    }

    checkEmailUniqueness ($("#registrationEmail").val());
  });

  // Login form submit event handler
  $('#loginForm').on('submit', e => {
    e.preventDefault();
    checkCredentials ($("#loginEmail").val(), $("#loginPassword").val());
  });

  // Login link click event handler
  $('#loginLink').click(() => {
    $("#loginDiv").removeClass("collapse");
    $("#registerDiv").addClass("collapse");
  });

  // Register link click event handler
  $('#registerLink').click(() => {
    $("#loginDiv").addClass("collapse");
    $("#registerDiv").removeClass("collapse");
  });
  
  // Profile menu selection click event handler
  $('#mnuProfile').click(() => {
    $("#tokenDiv").addClass("collapse");
    $("#profileDiv").removeClass("collapse");
  });  

  // Function that is invoked from multiple asynchronous callbacks
  // 1) Password encryption routine
  // 2) Routine that checks if the email was used for registration before
  //
  // Two global variables are used to ensure that we register the account only
  // after their password has been encrypted and their email address was
  // checked against the database.
  var doRegister = () => {
    if (pwChecked && emailChecked) {
      saveAccount ();
    }
  };

  // Housekeeping in the UI after successful login: hiding and showing stuff
  var loginSuccess = token => {
    $("#loginDiv").addClass("collapse");
    $("#tokenCol").html(token);
    $("#tokenDiv").removeClass("collapse");
    $("#registerLink").addClass("collapse");
    $("#loginLink").addClass("collapse");
    $("#profileMenu").removeClass("collapse");
    $("#profileLink").text($("#loginEmail").val());
    $("#profileLink").append("<span class='caret'></span>");
  };

  // Password encryption. Refer to: https://code.google.com/p/javascript-bcrypt/
  var crypt = (pw, callback) => {
    var bcrypt = new bCrypt();
    var salt;

    try {
      // salt = bcrypt.gensalt(5);
      // Using static salt for simplicity.
      salt = "$2a$05$c1dqkkueYULqC5CCwmmEhO";
    } catch (err) {
      return;
    }

    try {
      bcrypt.hashpw (pw, salt, callback);
    } catch (err) {
      console.log ("Error during password encryption: " + err);
      return;
    }
  };

  // Callback invoked by crypt during the registration process
  // after successful password encryption
  var registerCryptCallback = hash => {
    if (debug) {
      console.log ("Password encrypted.");
    }
    pwChecked = true;
    encryptedPw = hash;
    doRegister();
  };

  // Generate a UUID for email verification
  var generateUUID = () => {
    var d = Date.now();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };  
  
  // Persisting the registration data
  var saveAccount = () => {
    var uuid = generateUUID();
    var account = new Account();
    account.set ({name: $("#registrationName").val()});
    account.set ({email: $("#registrationEmail").val()});
    account.set ({password: encryptedPw});
    account.set ({company: $("#registrationCompany").val()});
    account.set ({verification: uuid});    

    account.save( null, {
      success(object) {
        $(".success").show();
        // Switching from registration dialog to Login dialog
        $("#loginDiv").removeClass("collapse");
        $("#registerDiv").addClass("collapse");
        $("#loginPanel").html("<h3>Thank you for registering!<p>Login</h3>");
        // Copying over the registration email address from the registration form
        $("#loginEmail").val($("#registrationEmail").val());
        if (debug) {
          console.log('Account registered: ' + $("#registrationName").val());
        }
        
        // Send verification email
        Parse.Cloud.run('verify', {
            email: $("#registrationEmail").val(),
            uuid
          }, {
          success(result) {
            if (debug) {
              console.log('Account verification email sent.');  
            }
          },
          error(error) {
            if (debug) {
              alert("Error: " + error.code + " " + error.message);
            }            
          }
        });        
      },
      error(model, error) {
        $(".error").show();
      }
    });
  };

  // Function that checks that credentials entered through the login form
  // match the ones in the database.
  var checkCredentials = (email, password) => {
    var query = new Parse.Query(Account);
    query.equalTo("email", email);
    query.find({
      success(results) {
        if (debug) {
          console.log("Successfully retrieved " + results.length + (results.length === 1 ? " account." : " accounts."));
        }
        if (results.length === 1) {
          // Make sure account is verified
          if (results[0].get('verification').length > 0) {
            if (debug) {
              console.log ( "Account not verified." );  
            }
            
            $('#verify-error').removeClass('collapse');   
            return;
          }
          
          crypt (password, hash => {
            if (results[0].get('password') === hash) {
              if (debug) {
                console.log ('Account ' + email + ' successfully authenticated.')
              }
              loginSuccess(results[0].get('token'));
            }
            else {
              if (debug) {
                console.log ("Authentication failed.");
              }
              $('#login-error').removeClass('collapse');
            }
          });
        } else {
          if (debug) {
            console.log ("Account does not exist.");
          }
          $('#account-error').removeClass('collapse');          
        }
      },
      error(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  };

  // Function that checks that the email address provided during registration
  // hasn't been used before.
  var checkEmailUniqueness = email => {
    if (debug) {
      console.log ("Checking uniqueness of email in DB: " + email);
    }
    var query = new Parse.Query(Account);
    query.equalTo("email", email);
    query.find({
      success(results) {
        if (results.length > 0) {
          emailChecked = false;
          $("#email-error").removeClass("collapse");
          if (debug) {
            console.log("Email address " + email + " has been registered previously.");
          }
        }
        else {
          emailChecked = true;
          doRegister();
          if (debug) {
            console.log("Email address " + email + " is new, it has not been registered previously.");
          }
        }
      },
      error(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  };

});
