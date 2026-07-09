MESSAGE-ID ZINV.

* Message class for Inventory Management
* Structure: Message Number (001-999) + Type (E/Error, S/Success, W/Warning, I/Info)

* Error Messages
001   E &1 &2 (Duplicate Entry)
002   E Quantity cannot be negative
003   E Item not found or inactive: &1
004   E Insufficient stock. Current: &1
006   E Failed to create item: &1
008   E Failed to reduce stock
009   E Error: &
011   E Failed to reduce stock
014   E Failed to delete item

* Success Messages
005   S &1: &2
007   S Stock added successfully: &1 &2
010   S Stock reduced successfully: &1 &2
012   S Item modified successfully
013   S Item deleted successfully
015   S Inventory list displayed
016   S Low stock items displayed

* Warning Messages
050   W Stock below minimum level
051   W Stock above maximum level
052   W Item will be deactivated

* Information Messages
100   I Displaying item: &
101   I Processing batch update
102   I Inventory synchronization complete
103   I Total items processed: &
