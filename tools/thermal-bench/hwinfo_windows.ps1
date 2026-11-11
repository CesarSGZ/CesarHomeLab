# List HWiNFO's windows and their controls (reading captions works without elevation).
param([switch]$TopOnly)
Add-Type @"
using System;using System.Text;using System.Collections.Generic;using System.Runtime.InteropServices;
public class HwWin{public delegate bool P(IntPtr h,IntPtr l);[DllImport("user32")]static extern bool EnumWindows(P p,IntPtr l);[DllImport("user32")]static extern bool EnumChildWindows(IntPtr w,P p,IntPtr l);[DllImport("user32")]static extern int GetWindowText(IntPtr h,StringBuilder s,int n);[DllImport("user32")]static extern int GetClassName(IntPtr h,StringBuilder s,int n);[DllImport("user32")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);[DllImport("user32")]static extern bool IsWindowVisible(IntPtr h);
public static List<string> List(uint pid,bool top){var r=new List<string>();EnumWindows((h,l)=>{uint p;GetWindowThreadProcessId(h,out p);if(p==pid){var s=new StringBuilder(256);GetWindowText(h,s,256);if(s.Length==0)return true;r.Add("TOP "+h+" '"+s+"' vis="+IsWindowVisible(h));if(!top)EnumChildWindows(h,(c,l2)=>{var t=new StringBuilder(256);var k=new StringBuilder(64);GetWindowText(c,t,256);GetClassName(c,k,64);r.Add("   "+c+" ["+k+"] '"+t+"'");return true;},IntPtr.Zero);}return true;},IntPtr.Zero);return r;}}
"@
foreach ($proc in Get-Process HWiNFO64 -ErrorAction SilentlyContinue) { "PID $($proc.Id)"; [HwWin]::List([uint32]$proc.Id, [bool]$TopOnly) }
