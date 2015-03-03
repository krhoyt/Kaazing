//
//  ViewController.swift
//  Chat
//

import UIKit

class ViewController: UIViewController, UITextFieldDelegate, UITableViewDataSource, UITableViewDelegate {
    
    @IBOutlet weak var historyContainer: UIView!
    @IBOutlet weak var historyView: UITableView!
    @IBOutlet weak var messageField: UITextField!
    
    var items: [String] = ["Hello", "Hi", "Howdy"]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Keep message field visible
        NSNotificationCenter.defaultCenter().addObserver(
            self,
            selector: "keyboardWillShow:",
            name: UIKeyboardWillShowNotification,
            object: nil
        )
        
        NSNotificationCenter.defaultCenter().addObserver(
            self,
            selector: "keyboardWillHide:",
            name: UIKeyboardWillHideNotification,
            object: nil
        )
        
        // Hide keyboard on tap
        let taps = UITapGestureRecognizer( target: self, action: "handleSingleTap:" )
        taps.numberOfTapsRequired = 1
        self.view.addGestureRecognizer( taps )
        
        // Format message field
        messageField.leftViewMode = UITextFieldViewMode.Always
        messageField.leftView = UIView( frame: CGRect( x: 0, y: 0, width: 10, height: 35 ) )
        messageField.layer.masksToBounds = true
        messageField.layer.borderColor = UIColor( red: 0, green: 0, blue: 0, alpha: 0.20 ).CGColor
        messageField.layer.borderWidth = 1.0
        messageField.delegate = self
        messageField.attributedPlaceholder = NSAttributedString(
            string: "Enter message here.",
            attributes: [
                NSForegroundColorAttributeName: UIColor( red: 0, green: 0, blue: 0, alpha: 0.40 )
            ]
        )
        
        // Format history container
        historyContainer.layer.masksToBounds = true
        historyContainer.layer.borderColor = UIColor( red: 0, green: 0, blue: 0, alpha: 0.20 ).CGColor
        historyContainer.layer.borderWidth = 1.0
        
        // Table view cell
        historyView.registerClass( UITableViewCell.self, forCellReuseIdentifier: "cell" )
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    deinit {
        NSNotificationCenter.defaultCenter().removeObserver( self )
    }
    
    // Animate message field to accomodate for keyboard
    func animateViewMoving( up: Bool, move: CGFloat ) {
        UIView.beginAnimations( "animateView", context: nil )
        UIView.setAnimationBeginsFromCurrentState( true )
        UIView.setAnimationDuration( 0.3 )
        self.view.frame = CGRectOffset( self.view.frame, 0, up ? ( 0 - move ) : move )
        UIView.commitAnimations()
    }
    
    // Handler for tap outside keyboard
    func handleSingleTap( recognizer: UITapGestureRecognizer ) {
        self.view.endEditing( true )
    }
    
    // Handler to put field back when done editing
    func keyboardWillHide( notification: NSNotification ) {
        var info = notification.userInfo!
        var keyboard: CGRect = ( info[UIKeyboardFrameEndUserInfoKey] as NSValue ).CGRectValue()
        
        animateViewMoving( false, move: keyboard.size.height )
    }
    
    // Handler to keep field visible when editing
    func keyboardWillShow( notification: NSNotification ) {
        var info = notification.userInfo!
        var keyboard: CGRect = ( info[UIKeyboardFrameEndUserInfoKey] as NSValue ).CGRectValue()
        
        animateViewMoving( true, move: keyboard.size.height )
    }
    
    func tableView( tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath ) -> UITableViewCell {
        var cell:UITableViewCell = historyView.dequeueReusableCellWithIdentifier( "cell" ) as UITableViewCell
        
        cell.textLabel?.text = items[indexPath.row]
        
        return cell
    }
    
    func tableView( tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath ) {
        println( "You selected cell #\( indexPath.row )!" )
    }
    
    func tableView( tableView: UITableView, numberOfRowsInSection section: Int ) -> Int {
        return items.count
    }
    
    // Handler for return key on keyboard
    func textFieldShouldReturn( field: UITextField ) -> Bool {
        items.append(field.text);
        historyView.reloadData();
        
        field.text = ""
        self.view.endEditing( true )
        
        return false;
    }
}

