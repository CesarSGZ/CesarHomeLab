# Run the existing, unprivileged router task immediately before entering a low-power state.
# Periodic refresh alone is insufficient: this router can relearn the entry dynamically after resume.
[CmdletBinding()]
param([string]$TaskName = 'ServerCesar Router ARP', [int]$TimeoutSeconds = 90)
$ErrorActionPreference = 'Stop'
try {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop).State -eq 'Running') {
        if ((Get-Date) -ge $deadline) { throw 'Existing router task did not finish' }
        Start-Sleep -Seconds 1
    }
    # Task Scheduler timestamps have whole-second precision.
    $requested = (Get-Date).AddSeconds(-1)
    $previousRun = (Get-ScheduledTaskInfo -TaskName $TaskName -ErrorAction Stop).LastRunTime
    Start-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    do {
        Start-Sleep -Seconds 1
        $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
        $info = Get-ScheduledTaskInfo -TaskName $TaskName -ErrorAction Stop
        if ($info.LastRunTime -ge $requested -and $info.LastRunTime -gt $previousRun -and $task.State -eq 'Ready') {
            if ($info.LastTaskResult -ne 0) { throw 'Router preparation failed' }
            Write-Output 'Router wake preparation completed'
            exit 0
        }
    } while ((Get-Date) -lt $deadline)
    throw 'Router preparation timed out'
} catch {
    Write-Output ('Wake preparation failed; power transition cancelled: ' + $_.Exception.Message)
    exit 1
}
