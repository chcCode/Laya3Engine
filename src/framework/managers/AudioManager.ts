/** 音频播放封装，统一管理音乐和音效音量。 */
export class AudioManager {
    /** 背景音乐音量，范围由 Laya SoundManager 处理。 */
    musicVolume = 1;
    /** 音效音量，范围由 Laya SoundManager 处理。 */
    soundVolume = 1;

    /** 播放背景音乐，loops 为 0 时循环播放。 */
    playMusic(url: string, loops = 0): void {
        Laya.SoundManager.musicVolume = this.musicVolume;
        Laya.SoundManager.playMusic(url, loops);
    }

    /** 停止当前背景音乐。 */
    stopMusic(): void {
        Laya.SoundManager.stopMusic();
    }

    /** 播放一次或多次音效。 */
    playSound(url: string, loops = 1): void {
        Laya.SoundManager.soundVolume = this.soundVolume;
        Laya.SoundManager.playSound(url, loops);
    }

    /** 停止全部音乐和音效。 */
    stopAll(): void {
        Laya.SoundManager.stopAll();
    }
}
