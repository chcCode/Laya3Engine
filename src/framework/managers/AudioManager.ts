export class AudioManager {
    musicVolume = 1;
    soundVolume = 1;

    playMusic(url: string, loops = 0): void {
        Laya.SoundManager.musicVolume = this.musicVolume;
        Laya.SoundManager.playMusic(url, loops);
    }

    stopMusic(): void {
        Laya.SoundManager.stopMusic();
    }

    playSound(url: string, loops = 1): void {
        Laya.SoundManager.soundVolume = this.soundVolume;
        Laya.SoundManager.playSound(url, loops);
    }

    stopAll(): void {
        Laya.SoundManager.stopAll();
    }
}
