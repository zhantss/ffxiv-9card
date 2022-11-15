!include "EnvVarUpdate.nsh"
!macro customInstall
    ${EnvVarUpdate} $0 "FFXIV_9CARD_HOME" "A" "HKCU" "$INSTDIR"
!macroend
!macro customUnInstall
    ${un.EnvVarUpdate} $0 "FFXIV_9CARD_HOME" "R" "HKCU" "$INSTDIR"
!macroend