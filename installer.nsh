!macro customInstall
  DeleteRegKey HKCR "mpptx"
  WriteRegStr HKCR "mpptx" "" "URL:mpptx"
  WriteRegStr HKCR "mpptx" "URL Protocol" ""
  WriteRegStr HKCR "mpptx\shell" "" ""
  WriteRegStr HKCR "mpptx\shell\Open" "" ""
  WriteRegStr HKCR "mpptx\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "m'p'p't'x"
!macroend