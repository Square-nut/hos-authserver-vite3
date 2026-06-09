export const initializeCmdShell = async () => {
  let platform = window.navigator.platform;
  let windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  if (windowsPlatforms.includes(platform)) {
    const CmdWindows = await import('@/utils/websys.addins')
    return CmdWindows
  } else if (/Linux/i.test(platform)) {
    const CmdLinux = await import('@/utils/websys.addins.linux')
    return CmdLinux;
  } else {
    console.error("无法确定当前系统类型");
    throw new Error("未知系统类型");
  }
};
