function load_worker(kind, startEpoch, durationS, markerFile)
%LOAD_WORKER Wait until startEpoch (POSIX seconds, UTC) and load the CPU or GPU for durationS.
%   kind = 'cpu' : multithreaded double-precision matrix products on every core.
%   kind = 'gpu' : single-precision matrix products on the RTX (power-limit bound).
%   A marker line with the real start/end times is appended to markerFile.

if ischar(startEpoch) || isstring(startEpoch), startEpoch = str2double(startEpoch); end
if ischar(durationS) || isstring(durationS), durationS = str2double(durationS); end
nowEpoch = @() posixtime(datetime('now', 'TimeZone', 'UTC'));

switch kind
    case 'cpu'
        maxNumCompThreads(feature('numcores'));
        A = rand(2048); B = rand(2048);
        step = @() A * B;
    case 'gpu'
        g = gpuDevice; %#ok<NASGU>
        A = rand(8192, 'single', 'gpuArray'); B = rand(8192, 'single', 'gpuArray');
        C = A * B; wait(gpuDevice); %#ok<NASGU> warm-up before the clock starts
        step = @() A * B;
    otherwise
        error('kind must be cpu or gpu');
end

while nowEpoch() < startEpoch
    pause(min(0.5, max(0.01, startEpoch - nowEpoch())));
end

t0 = nowEpoch(); n = 0;
while nowEpoch() - t0 < durationS
    C = step(); %#ok<NASGU>
    n = n + 1;
    if strcmp(kind, 'gpu') && mod(n, 8) == 0, wait(gpuDevice); end
end
if strcmp(kind, 'gpu'), wait(gpuDevice); end
t1 = nowEpoch();

fid = fopen(markerFile, 'a');
fprintf(fid, '%s,%.3f,%.3f,%d\n', kind, t0, t1, n);
fclose(fid);
end
