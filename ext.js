const Main = imports.ui.main;
const GObject = imports.gi.GObject;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const {St, GLib, Clutter, Gio} = imports.gi;

let myPopup;

const MyPopup = GObject.registerClass(
class MyPopup extends PanelMenu.Button {
  
  _init () {
  
    super._init(0);
    
    this.icon = new St.Icon({
      //icon_name : 'security-low-symbolic',
      gicon : Gio.icon_new_for_string( Me.dir.get_path() + '/battery.svg' ),
      style_class : 'system-status-icon',
    });
    
    // this.icon.connect('button-press-event', (widget) => {
    //   widget.gicon = Gio.icon_new_for_string( Me.dir.get_path() + '/icons.svg' )
    // }) 

    this.connect('button-press-event', ()=>{
      log('the main')
      log(this.text)
      this.text.text = '🔋☠️🔋🍀🔋⚡'
     // this.icon.gicon = Gio.icon_new_for_string( Me.dir.get_path() + '/icons.svg' )
    })
    //this.add_child(this.icon);
    this.text = new St.Label({
      text : "Starting ...",
      y_align: Clutter.ActorAlign.CENTER,
    }) 
    this.add_child(this.text)
    // this.actor.add_child(this.icon);

    // this.panelButtonText = new St.Label({
    //   style_class : "examplePanelText",
    //   text : "Starting ...",
    //   y_align: Clutter.ActorAlign.CENTER,
    // });

    //this.add_child(this.panelButtonText)
    // Add a menu item
    this.menu.addAction('Menu Item', ()=>{

    }, null);
  
    
    let pmItem = new PopupMenu.PopupMenuItem('Normal Menu Item');
    pmItem.add_child( new St.Label({ text : 'Label added to the end' }) );
    this.menu.addMenuItem(pmItem);
    
    pmItem.connect('activate', () => {
      log('clicked');
      
    });
    
    this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem() );
    
    this.menu.addMenuItem(
      new PopupMenu.PopupMenuItem(
        "User cannot click on this item",
        {reactive : false},
      )
    );
    
    this.menu.connect('open-state-changed', (menu, open) => {
      if (open) {
        log('opened');
      } else {
        log('closed');
      }
    });
    
    // sub menu
    let subItem = new PopupMenu.PopupSubMenuMenuItem('sub menu item');
    this.menu.addMenuItem(subItem);
    subItem.menu.addMenuItem( new PopupMenu.PopupMenuItem('item 1') );
    subItem.menu.addMenuItem( new PopupMenu.PopupMenuItem('item 2'), 0 );
    
    // section
    let popupMenuSection = new PopupMenu.PopupMenuSection();
    popupMenuSection.actor.add_child( new PopupMenu.PopupMenuItem('section') );
    this.menu.addMenuItem(popupMenuSection);
    
    // image item
    let popupImageMenuItem = new PopupMenu.PopupImageMenuItem(
      'Menu Item with Icon',
      'security-high-symbolic',
    );
    popupImageMenuItem.connect('activate', (widget)=>{
      //let state = get_battery_state()
      //this.remove_child()
      log(widget.image)
      widget.icon = 'battery-low-symbolic'
    })
    this.menu.addMenuItem(popupImageMenuItem);
    
    // you can close, open and toggle the menu with
    // this.menu.close();
    // this.menu.open();
    // this.menu.toggle();
  }

});

function init() {
}

function enable() {
  myPopup = new MyPopup();
  Main.panel.addToStatusArea('myPopup', myPopup, 1);
}

function disable() {
  myPopup.destroy();
}

function get_battery_state(){
  var [ok, out, err, exit] = GLib.spawn_command_line_sync('cat /sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode');
  if (out.length > 0) {
    state = out.toString().trim('\n')
    if(state=='0')
      return 0
    else if (state== '1')
      return 1
    else 
      return -1
  }
}