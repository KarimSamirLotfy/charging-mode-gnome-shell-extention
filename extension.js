const Main = imports.ui.main;
const GObject = imports.gi.GObject;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const {St, GLib, Clutter, Gio} = imports.gi;
const MainLoop = imports.mainloop

let myPopup; // the extention object iteslef
let timeout; // the timout to check the sattus of the battery 
//<a target="_blank" href="https://icons8.com/icons/set/medium-battery">Battery Level icon</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
//<a target="_blank" href="https://icons8.com/icons/set/charge-battery--v1">Charging Battery icon</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
const MyPopup = GObject.registerClass(
class MyPopup extends PanelMenu.Button {
  
  _init () {
    super._init(0);

    this.connect('button-press-event', ()=>{
      //log('clicked the extention')
      update_battery_status()
    })
    this.text = new St.Label({
      text : "...",
      y_align: Clutter.ActorAlign.CENTER,
    }) 

    this.add_child(this.text)    
    this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem() );
    this.menu.addMenuItem(
      new PopupMenu.PopupMenuItem(
        "Charging mode",
        {reactive : false},
      )
    );
    
    
    this.menu.connect('open-state-changed', (menu, open) => {
      
    });
    
    let conservation_mode_icon = Gio.icon_new_for_string( Me.dir.get_path() + '/healthy_charging.svg' )
    let conservative_mode_on_btn = new PopupMenu.PopupImageMenuItem(
      'Healthy Charging Mode',
      conservation_mode_icon,
    );
    conservative_mode_on_btn.connect('activate', (widget)=>{
      log('Battery conservation mode is turned on')
      set_conservative_mode_on()    
    })
    this.menu.addMenuItem(conservative_mode_on_btn); 
    
    let normal_mode_icon = Gio.icon_new_for_string( Me.dir.get_path() + '/normal_charging.svg' )
    let conservative_mode_off_btn = new PopupMenu.PopupImageMenuItem(
      'Normal Charging Mode',
      normal_mode_icon,
    );
    conservative_mode_off_btn.connect('activate', ()=>{
      log('pressed off')
      set_conservative_mode_off()
    })
    this.menu.addMenuItem(conservative_mode_off_btn);
    
    // you can close, open and toggle the menu with
    // this.menu.close();
    // this.menu.open();
    // this.menu.toggle();

    
  }
  get_battery_state(){
    let [ok, out, err, exit] = GLib.spawn_command_line_sync('cat /sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode');
  if (out.length > 0) {
    state = out.toString().trim('\n')
    if(state=='0')
      return 0
    else if (state== '1')
      return 1
  }else 
    return -1
  }
  
  

});
let status;



function get_battery_state(){
  var [ok, out, err, exit] = GLib.spawn_command_line_sync('cat /sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode');
  if (out.length > 0) {
    state = out.toString().trim('\n')
    if(state=='0')
      return 0
    else if (state== '1')
      return 1
  }else 
  return -1
}
function update_battery_status(){
  let state = get_battery_state()
  if(state==null){
    log('the Battery state is null so the lenovo Battery conservation mode has failed state is null = ' + get_battery_state())
    return true
  }
  //log('state now = '+state)
  if(state==1) status.set_text(`🔋🍀`)
  if(state==0) status.set_text(`🔋⚡`) 
  if(state==-1) status.set_text(`error`)  
  return true
}
function set_conservative_mode_on(){
  let cmd = `pkexec  bash -c "echo 1 > /sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode\n"`
  let bool = GLib.spawn_command_line_async(cmd);
  // if(bool)
  //   log('logged true and conservations mode')
  // else 
  //   log('false ya beih')

}
function set_conservative_mode_off(){
  let cmd = `pkexec  bash -c "echo 0  > /sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode\n"`
  var bool = GLib.spawn_command_line_async(cmd);
  // if(bool){
  //   log('logged true and normal mode')
  // } else {
  //   log('false ya beih 2')
  // }
}

function _auto_dev_discovery(search_path) {
  let mod_path = Gio.file_new_for_path(search_path);

  let walker = mod_path.enumerate_children(
    "standard::name",
    Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
    null);

  let child = null;
  let found = null;
  while ((child = walker.next_file(null))) {
    if (child.get_is_symlink() && child.get_name().startsWith("VPC2004")) {
      // ideapad_device_ids[] from the kernel module ideapad_acpi.c
      found = _auto_dev_discovery(`${search_path}/${child.get_name()}`);
    } else if (child.get_name() == "conservation_mode") {
      log(`IdeaPad device FOUND at ${search_path}`);
      found = `${search_path}/${child.get_name()}`;
    }
    // Stop as soon as the device is found.
    if (found !== null) break;
  }

  return found;
}
// Commands
// echo 1 | sudo tee /sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode
// pkexec  bash -c "echo 1  > /sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode\n


function enable() {
  myPopup = new MyPopup();
  status = myPopup.text;
  Main.panel.addToStatusArea('myPopup', myPopup, 1);
  timeout = MainLoop.timeout_add_seconds(3.,update_battery_status)
}

function disable() {
  myPopup.destroy();
  myPopup = null;
  MainLoop.source_remove(timeout)
}
