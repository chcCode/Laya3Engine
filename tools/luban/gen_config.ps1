param(
    [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..").Path,
    [string]$Luban = "",
    [string]$CodeTarget = "typescript",
    [string]$DataTarget = "json"
)

$ErrorActionPreference = "Stop"

$LubanDir = Join-Path $ProjectRoot "tools\luban"
$DefineDir = Join-Path $ProjectRoot "config\luban\Defines"
$DataDir = Join-Path $ProjectRoot "config\luban\Datas"
$JsonOut = Join-Path $ProjectRoot "assets\resources\config\json"
$CodeOut = Join-Path $ProjectRoot "src\game\config\generated"

if ([string]::IsNullOrWhiteSpace($Luban)) {
    $candidates = @(
        (Join-Path $LubanDir "Luban.ClientServer.exe"),
        (Join-Path $LubanDir "Luban.ClientServer.dll")
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            $Luban = $candidate
            break
        }
    }
}

if ([string]::IsNullOrWhiteSpace($Luban) -or -not (Test-Path $Luban)) {
    throw "Luban executable was not found. Put Luban.ClientServer.exe or Luban.ClientServer.dll in tools/luban, or pass -Luban <path>."
}

New-Item -ItemType Directory -Force $JsonOut, $CodeOut | Out-Null

$args = @(
    "-j", "cfg",
    "--^target", $DataTarget,
    "--^codeTarget", $CodeTarget,
    "--^conf", $DefineDir,
    "--^data", $DataDir,
    "--^outputDataDir", $JsonOut,
    "--^outputCodeDir", $CodeOut
)

if ([IO.Path]::GetExtension($Luban) -eq ".dll") {
    dotnet $Luban @args
} else {
    & $Luban @args
}

Write-Host "Luban config generated:"
Write-Host "  data: $JsonOut"
Write-Host "  code: $CodeOut"
