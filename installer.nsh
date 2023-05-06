!macro customInstall
  DeleteRegKey HKCR "vue-cli-electron"
  WriteRegStr HKCR "vue-cli-electron" "" "URL:vue-cli-electron"
  WriteRegStr HKCR "vue-cli-electron" "URL Protocol" ""
  WriteRegStr HKCR "vue-cli-electron\shell" "" ""
  WriteRegStr HKCR "vue-cli-electron\shell\Open" "" ""
  WriteRegStr HKCR "vue-cli-electron\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "vue-cli-electron"
!macroend