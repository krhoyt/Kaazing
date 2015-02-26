//
//  ViewController.swift
//  Chat
//

import UIKit;

class ViewController: UIViewController, UITextFieldDelegate
{
    // var history: UITableView;
    private var message: UITextField;
    // var items:[String] = ["Kevin", "Hoyt"];

    required init( coder aDecoder: NSCoder )
    {
        fatalError( "NSCoder has not been implemented." );
    }

    override func viewDidLoad()
    {
        super.viewDidLoad();
        
        // Keep message field visible
        NSNotificationCenter.defaultCenter().addObserver(
            self,
            selector: "keyboardWillShow:",
            name: UIKeyboardWillShowNotification,
            object: nil
        );
        
        NSNotificationCenter.defaultCenter().addObserver(
            self,
            selector: "keyboardWillHide:",
            name: UIKeyboardWillHideNotification,
            object: nil
        );
        
        // Hide keyboard on tap
        // Bit of a hack due to blocking
        let taps = UITapGestureRecognizer( target: self, action: "handleSingleTap:" );
        taps.numberOfTapsRequired = 1;
        self.view.addGestureRecognizer( taps );
        
        // Message
        message = UITextField( frame: CGRect(
            x: 10,
            y: self.view.bounds.height - 10 - 35,
            width: self.view.bounds.width - 10 - 10,
            height: 35
        ) );
        message.font = UIFont.systemFontOfSize( 14.0 );
        message.placeholder = "Enter your message here.";
        message.returnKeyType = UIReturnKeyType.Send;
        message.leftViewMode = UITextFieldViewMode.Always;
        message.leftView = UIView( frame: CGRect( x: 0, y: 0, width: 10, height: 35 ) );
        message.layer.masksToBounds = true;
        message.layer.borderColor = UIColor( red: 0, green: 0, blue: 0, alpha: 0.40 ).CGColor;
        message.layer.borderWidth = 1.0;
        message.delegate = self;
        self.view.addSubview( message );
        
        // History
        var history = UITableView( frame: CGRect(
            x: 10,
            y: statusBarHeight() + 10,
            width: self.view.bounds.width - 10 - 10,
            height: self.view.bounds.height - statusBarHeight() - 10 - 10 - 35 - 10
        ) );
        // history.delegate = self;
        // history.dataSource = self;
        history.layer.masksToBounds = true;
        history.layer.borderColor = UIColor( red: 0, green: 0, blue: 0, alpha: 0.40 ).CGColor;
        history.layer.borderWidth = 1.0;
        self.view.addSubview( history );
    }
    
    deinit {
        NSNotificationCenter.defaultCenter().removeObserver( self );
    }
    
    // Handler for tap outside keyboard
    func handleSingleTap( recognizer: UITapGestureRecognizer )
    {
        self.view.endEditing( true );
    }
    
    // Handler to put field back when done editing
    func keyboardWillHide( notification: NSNotification )
    {
        var info = notification.userInfo!;
        var keyboard: CGRect = ( info[UIKeyboardFrameEndUserInfoKey] as NSValue ).CGRectValue();
        
        animateViewMoving( false, move: keyboard.size.height );
    }
    
    // Handler to keep field visible when editing
    func keyboardWillShow( notification: NSNotification )
    {
        var info = notification.userInfo!;
        var keyboard: CGRect = ( info[UIKeyboardFrameEndUserInfoKey] as NSValue ).CGRectValue();
        
        animateViewMoving( true, move: keyboard.size.height );
    }
    
    // Handler for return key on keyboard
    func textFieldShouldReturn( field: UITextField ) -> Bool
    {
        field.text = "";
        self.view.endEditing( true );
        
        return false;
    }
    
    // Animate message field to accomodate for keyboard
    func animateViewMoving( up: Bool, move: CGFloat )
    {
        UIView.beginAnimations( "animateView", context: nil );
        UIView.setAnimationBeginsFromCurrentState( true );
        UIView.setAnimationDuration( 0.3 );
        self.view.frame = CGRectOffset( self.view.frame, 0, up ? ( 0 - move ) : move );
        UIView.commitAnimations();
    }
    
    // Utility for OS status bar height
    func statusBarHeight() -> CGFloat
    {
        let statusBarSize = UIApplication.sharedApplication().statusBarFrame.size;
        return Swift.min( statusBarSize.width, statusBarSize.height )
    }
}
