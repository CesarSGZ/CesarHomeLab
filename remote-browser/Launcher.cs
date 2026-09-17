using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Windows.Forms;
using Microsoft.Win32;
[assembly: AssemblyTitle("CesarPC Remote Browser")]
[assembly: AssemblyProduct("CesarPC Remote Browser")]
static class Launcher {
 [STAThread] static void Main(string[] args) {
  Application.EnableVisualStyles();
  string link=args.Length==1?args[0]:"";
  if(!Regex.IsMatch(link,@"^cesar-remote://(login|start|stop)/?$")){MessageBox.Show("Enlace no valido.","CesarPC Remote Browser");return;}
  string mode=new Uri(link).Host;
  string log=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"CesarHomeLab","RemoteBrowser","launcher.log");
  File.AppendAllText(log,DateTime.Now.ToString("o")+" Native launcher: "+mode+Environment.NewLine);
  var form=new Form {Text="CesarPC Remote Browser",Width=620,Height=320,StartPosition=FormStartPosition.CenterScreen,TopMost=true};
  var text=new TextBox {Multiline=true,ReadOnly=true,Dock=DockStyle.Fill,Font=new Font("Segoe UI",11),ScrollBars=ScrollBars.Vertical};
  text.Text=mode=="login"?"Iniciar sesion en ChatGPT.\r\n\r\nSe abrira tu navegador dedicado. Identificate alli; despues cierra esa ventana y pulsa Activar en la web.":mode=="start"?"Activar el navegador remoto en CesarPC.\r\n\r\nNo se activara automaticamente al iniciar Windows.":"Apagar el navegador remoto de CesarPC.";
  var button=new Button {Text="Continuar",Dock=DockStyle.Bottom,Height=45};
  form.Controls.Add(text);form.Controls.Add(button);
  bool finished=false;
  button.Click+=async delegate {
   if(finished){form.Close();return;}
   form.TopMost=false;
   button.Enabled=false;
   try {
    using(var key=Registry.CurrentUser.OpenSubKey(@"Software\CesarHomeLab\RemoteLauncher")) {
     if(key==null)throw new Exception("Falta registrar el lanzador.");
     string shell=(string)key.GetValue("PowerShell"),script=(string)key.GetValue("Script");
     var process=new Process {StartInfo=new ProcessStartInfo(shell,"-NoProfile -File \""+script+"\" -Confirmed -Link \"cesar-remote://"+mode+"\"") {UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true}};
     process.Start();
     var output=process.StandardOutput.ReadToEndAsync();var error=process.StandardError.ReadToEndAsync();
     await System.Threading.Tasks.Task.Run(()=>process.WaitForExit());
     string result=await output,errors=await error;
     if(process.ExitCode!=0)throw new Exception(errors+result);
     text.Text=mode=="login"?"Ventana de inicio de sesion abierta.\r\n\r\nIdentificate en Edge. Cierra esa ventana cuando termines y pulsa Activar Remote Browser en la web.":mode=="start"?"Remote Browser activado.\r\n\r\nVuelve a la web y pulsa Connect.":"Remote Browser apagado.";
    }
   }catch(Exception e){text.Text="No se ha completado la accion:\r\n"+e.Message;}
   finished=true;button.Text="Cerrar";button.Enabled=true;
  };
  Application.Run(form);
 }
}
