# Drive HWiNFO's dialogs from an elevated process (UIPI blocks this from a normal one).
# Actions, run in order, separated by ';':
#   kill                 stop every HWiNFO64 process
#   start                start the portable copy in Desktop\Claude\Cache\HWiNFO64
#   wait:<seconds>
#   click:<caption>      press the button with that caption (any visible HWiNFO window)
#   set:<caption>=0|1    tick or untick the checkbox with that caption
#   dump                 write every visible window, control, class and check state to the log
param([string]$Actions = 'dump', [string]$Log = "$env:USERPROFILE\Desktop\Claude\Temporal\hwinfo_ui.log")
Add-Type @"
using System;using System.Text;using System.Collections.Generic;using System.Runtime.InteropServices;
public class HwUi{public delegate bool P(IntPtr h,IntPtr l);
[DllImport("user32")]static extern bool EnumWindows(P p,IntPtr l);[DllImport("user32")]static extern bool EnumChildWindows(IntPtr w,P p,IntPtr l);
[DllImport("user32")]static extern int GetWindowText(IntPtr h,StringBuilder s,int n);[DllImport("user32")]static extern int GetClassName(IntPtr h,StringBuilder s,int n);
[DllImport("user32")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);[DllImport("user32")]static extern bool IsWindowVisible(IntPtr h);
[DllImport("user32")]public static extern IntPtr SendMessage(IntPtr h,uint m,IntPtr w,IntPtr l);[DllImport("user32")]public static extern bool PostMessage(IntPtr h,uint m,IntPtr w,IntPtr l);
public static string Text(IntPtr h){var s=new StringBuilder(512);GetWindowText(h,s,512);return s.ToString();}
public static string Cls(IntPtr h){var s=new StringBuilder(64);GetClassName(h,s,64);return s.ToString();}
public static List<IntPtr[]> Controls(uint[] pids){var r=new List<IntPtr[]>();EnumWindows((h,l)=>{uint p;GetWindowThreadProcessId(h,out p);if(Array.IndexOf(pids,p)>=0&&IsWindowVisible(h)){r.Add(new IntPtr[]{h,IntPtr.Zero});EnumChildWindows(h,(c,l2)=>{r.Add(new IntPtr[]{h,c});return true;},IntPtr.Zero);}return true;},IntPtr.Zero);return r;}}
"@
$exe = "$env:USERPROFILE\Desktop\Claude\Cache\HWiNFO64\HWiNFO64.EXE"
$out = New-Object System.Collections.Generic.List[string]
function Pids { [uint32[]]@(Get-Process HWiNFO64 -ErrorAction SilentlyContinue | ForEach-Object Id) }
function Norm([string]$s) { ($s -replace '&', '').Trim() }
function Find([string]$caption) {
    # A caption ending in '*' matches by prefix (some captions carry a second line).
    $prefix = $caption.EndsWith('*'); $want = $caption.TrimEnd('*')
    foreach ($pair in [HwUi]::Controls((Pids))) {
        if ($pair[1] -eq [IntPtr]::Zero) { continue }
        $text = Norm ([HwUi]::Text($pair[1]))
        if (($prefix -and $text.StartsWith($want)) -or (-not $prefix -and $text -eq $want)) { return $pair[1] }
    }
    return [IntPtr]::Zero
}
foreach ($action in $Actions -split ';') {
    $verb, $arg = $action.Trim() -split ':', 2
    switch ($verb) {
        'kill' { Get-Process HWiNFO64 -ErrorAction SilentlyContinue | Stop-Process -Force; $out.Add('killed') }
        'start' { Start-Process $exe; $out.Add('started') }
        'wait' { Start-Sleep -Seconds ([double]$arg) }
        'click' {
            $h = Find $arg
            if ($h -eq [IntPtr]::Zero) { $out.Add("click '$arg': NOT FOUND") } else { [void][HwUi]::PostMessage($h, 0x00F5, [IntPtr]::Zero, [IntPtr]::Zero); $out.Add("click '$arg' ok") }
        }
        'set' {
            $caption, $want = $arg -split '=', 2
            $h = Find $caption
            if ($h -eq [IntPtr]::Zero) { $out.Add("set '$caption': NOT FOUND"); continue }
            $state = [int][HwUi]::SendMessage($h, 0x00F0, [IntPtr]::Zero, [IntPtr]::Zero)
            if ($state -ne [int]$want) { [void][HwUi]::SendMessage($h, 0x00F5, [IntPtr]::Zero, [IntPtr]::Zero) }
            $after = [int][HwUi]::SendMessage($h, 0x00F0, [IntPtr]::Zero, [IntPtr]::Zero)
            $out.Add("set '$caption' $state -> $after")
        }
        'dump' {
            foreach ($pair in [HwUi]::Controls((Pids))) {
                if ($pair[1] -eq [IntPtr]::Zero) { $out.Add("TOP '$([HwUi]::Text($pair[0]))'"); continue }
                $c = $pair[1]; $cls = [HwUi]::Cls($c); $extra = ''
                if ($cls -eq 'Button') { $extra = " check=$([int][HwUi]::SendMessage($c, 0x00F0, [IntPtr]::Zero, [IntPtr]::Zero))" }
                $out.Add("   [$cls] '$([HwUi]::Text($c))'$extra")
            }
        }
    }
}
$out | Out-File -Encoding utf8 $Log
