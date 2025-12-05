Set oShell = CreateObject("WScript.Shell")
oShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
oShell.Run "cmd /c npm run dev", 0, False

