//
//  TableViewController.swift
//  Chat
//

import UIKit

class TableViewController: UITableViewController
{
    override func tableView( tableView: UITableView, numberOfRowsInSection section: Int ) -> Int
    {
        return 1;
    }
    
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        var cell: UITableViewCell? = tableView.dequeueReusableCellWithIdentifier("UITableViewCell") as? UITableViewCell;
        
        if !(cell != nil) {
            cell = UITableViewCell( style: .Default, reuseIdentifier: "UITableViewCell")
        }
        
        switch indexPath.row {
            case 0:
                cell!.textLabel?.text = "Item 1";
        }
        
        return cell as UITableViewCell;
    }
    
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        var dvc = ViewController(nibName: nil, bundle: nil);
        
        presentViewController(dvc, animated: true, completion: nil)
    }
}
