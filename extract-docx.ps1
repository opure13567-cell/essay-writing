Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("D:\essay-writing\assignment.docx")
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$text = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
# Remove XML tags
$text -replace '<[^>]+>', ' ' -replace '\s+', ' ' | Out-File -FilePath "D:\essay-writing\assignment-text.txt" -Encoding UTF8
Write-Output "Done"
