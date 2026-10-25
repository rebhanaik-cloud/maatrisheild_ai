$src = "C:\Users\Rebha Naik\Desktop\MaatriShield_AI_Presentation.pptx"
$dest1 = "C:\Users\Rebha Naik\Desktop\MaatriShield_AI_Presentation.ppt"
$dest2 = "C:\Users\Rebha Naik\Downloads\MaatriShield_AI_Full_Stack\maatrishield_ai\MaatriShield_AI_Presentation.ppt"

try {
    $pptApp = New-Object -ComObject PowerPoint.Application
    # Open presentation: ReadOnly = False, Untitled = False, WithWindow = False (msoFalse = 0)
    $presentation = $pptApp.Presentations.Open($src, 0, 0, 0)
    # ppSaveAsPresentation = 1 (.ppt format)
    $presentation.SaveAs($dest1, 1)
    $presentation.SaveAs($dest2, 1)
    $presentation.Close()
    $pptApp.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null
    Write-Host "SUCCESS: Saved .ppt format to both locations"
} catch {
    Write-Error $_
}
