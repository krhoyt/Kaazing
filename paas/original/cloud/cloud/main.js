
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", (request, response) => {
  response.success("Hello world!");
});

Parse.Cloud.define("verify", (request, response) => {
  var SendGrid = require("sendgrid");
 
  var SENDGRID_USER = "";
  var SENDGRID_PASSWORD = "";
  
  SendGrid.initialize(SENDGRID_USER, SENDGRID_PASSWORD);
  SendGrid.sendEmail({
    to: request.params.email,
    from: "kevin.hoyt@kaazing.com",
    subject: "Kaazing Sandbox Account Verification!",
    text: "Please click on the following link to verify your Kaazing Sandbox account: " + request.params.uuid,
    replyto: "kevin.hoyt@kaazing.com"
  }).then(httpResponse => {
    console.log(httpResponse);
    response.success("Email sent!");
  },httpResponse => {
    console.error(httpResponse);
    response.error("Uh oh, something went wrong");
  });
});
