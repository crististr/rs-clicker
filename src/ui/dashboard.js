import { CONSTANTS, FONTS } from "../constants/constants.js";
import { Inventory } from "./inventory.js";
import { Equipment } from "./equipment.js";
import { Clan } from "./clan.js";
import { ScrollWindow } from "./scroll-window.js";
import { Button } from "./button.js";
import { calcLevel } from "../utilities.js";

export class DashboardScene extends Phaser.Scene {
    currentScene;
    currentLevel = "";
    currentPanel = "";

    inventory = {
        button: {},
        obj: {},
    };

    skills = {
        button: {},
        panel: {},
    };

    prayer = {
        button: {},
        panel: {},
        maxPrayerText: "",
        curPrayerText: "",
    };

    audio = {
        bgm: "",
        audioPage: {},
        audioPageButton: {},
        sliders: [],
        audioButtons: [],
        scene: {},
    };

    quests = {
        button: {},
        panel: {},
    };

    equipment = {
        button: {},
        panel: {},
        obj: {},
    };

    clan = {
        button: {},
        panel: {},
        obj: {},
        scrollWindow: {},
    };

    // Save data
    characterData;

    // Hotbar
    prayerHotbarText;

    // Skill text
    attackText;
    attackBottomText;
    rangedText;
    rangedBottomText;
    magicText;
    magicBottomText;
    totalLevelText;
    woodcuttingText;
    woodcuttingBottomText;
    prayerText;
    prayerBottomText;

    // TODO: Quests text probably for each enemy
    killQuestText;

    constructor() {
        super({ key: CONSTANTS.SCENES.DASHBOARD });
    }

    init(characterData) {
        this.characterData = characterData;
    }

    create() {
        // Get audio scene
        this.audio.scene = this.scene.get(CONSTANTS.SCENES.AUDIO);

        // Get current scene
        this.currentScene = this.scene.get(this.characterData.currentLevel);

        // Disable right click popup
        this.input.mouse.disableContextMenu();

        // Inventory
        this.inventory.button = this.add
            .image(626, 168, "inventory-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive()
            .setAlpha(0.1)
            .on("pointerdown", () => {
                this.hideAllMenus();

                this.inventory.obj.showInventory(true);
                this.inventory.button.setAlpha(0.1);
            });
        // Clear out and reinstantiate inventory
        if (Object.entries(this.inventory.obj).length) {
            this.inventory.obj.destroy();
        }
        this.inventory.obj = new Inventory(this, this.characterData.inventory);
        this.inventory.obj.showInventory(true);

        // Shop
        let shopButton = new Button(this, 595, 466, 33, 35);
        shopButton.on("pointerup", () => {
            console.log("Going to Shop");
            this.currentScene.scene.start(CONSTANTS.SCENES.SHOP, [
                this.characterData,
                this.characterData.currentLevel,
            ]);
        });

        // Logout
        let logoutButton = new Button(this, 630, 466, 27, 35);
        logoutButton.on("pointerup", () => {
            console.log("Going to main menu");
            this.currentScene.scene.start(CONSTANTS.SCENES.MAIN_MENU, this.characterData);
        });

        // Skills
        this.skills.panel = this.add
            .image(548, 208, "skills-panel")
            .setOrigin(0, 0)
            .setDepth(1);
        this.skills.button = this.add
            .image(560, 168, "skills-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive();
        this.skills.button.on("pointerdown", () => {
            this.showSkills(true);
        });

        // Hotbar skills text (the top part)
        this.prayerHotbarText = this.add
            .text(532, 97, "1", FONTS.HOTBAR)
            .setOrigin(0.5)
            .setDepth(3);

        // Skills text
        this.attackText = this.add
            .text(585, 220, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.attackBottomText = this.add
            .text(600, 230, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.rangedText = this.add
            .text(585, 310, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.rangedBottomText = this.add
            .text(600, 320, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.prayerText = this.add
            .text(585, 342, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.prayerBottomText = this.add
            .text(600, 352, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.magicText = this.add
            .text(585, 375, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.magicBottomText = this.add
            .text(600, 385, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.woodcuttingText = this.add
            .text(710, 375, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.woodcuttingBottomText = this.add
            .text(725, 385, "1", { fontSize: "12px" })
            .setOrigin(0.5)
            .setDepth(2);
        this.totalLevelText = this.add
            .text(705, 450, "1", { fontSize: "12px", fill: "yellow" })
            .setOrigin(0.5)
            .setDepth(2);

        // Set and hide skills page on startup
        this.updateSkillsText();
        this.showSkills(false);

        // Prayer
        this.prayer.panel = this.add
            .image(548, 205, "prayer-panel")
            .setOrigin(0, 0)
            .setDepth(1);
        this.prayer.button = this.add
            .image(692, 168, "prayer-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive()
            .on("pointerdown", () => {
                this.showPrayer(true);
            });
        this.prayer.curPrayerText = this.add
            .text(630, 441, "1", FONTS.PRAYER)
            .setOrigin(0.5)
            .setDepth(3);
        this.prayer.maxPrayerText = this.add
            .text(646, 441, "1", FONTS.PRAYER)
            .setOrigin(0.5)
            .setDepth(3);
        this.showPrayer(false);

        // Audio settings
        let audioWindowX = 550;
        let audioWindowY = 205;
        this.audio.audioPage = this.add
            .image(audioWindowX, audioWindowY, "audio-settings")
            .setOrigin(0, 0)
            .setDepth(1);
        this.audio.audioPageButton = this.add
            .image(659, 466, "audio-settings-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive()
            .on("pointerdown", () => {
                this.showAudioSettings(true);
            });

        // Place sliders
        let barXOffset = 53;
        this.audio.sliders = [];
        this.audio.sliders.push(
            this.add
                .image(audioWindowX + barXOffset, audioWindowY + 80, "audio-slider")
                .setOrigin(0, 0)
                .setDepth(2)
        );
        this.audio.sliders.push(
            this.add
                .image(audioWindowX + barXOffset, audioWindowY + 125, "audio-slider")
                .setOrigin(0, 0)
                .setDepth(2)
        );
        this.audio.sliders.push(
            this.add
                .image(audioWindowX + barXOffset, audioWindowY + 170, "audio-slider")
                .setOrigin(0, 0)
                .setDepth(2)
        );

        // Set 5 buttons for each of the 3 sliders
        this.audio.audioButtons = [];
        for (let volumeType = 0; volumeType < 3; volumeType++) {
            let audioButtonRow = [];
            for (let buttonNum = 0; buttonNum < 5; buttonNum++) {
                let audioButton = this.add
                    .image(
                        audioWindowX + barXOffset + 10 + buttonNum * 22,
                        audioWindowY + 80 + volumeType * 45,
                        "audio-button"
                    )
                    .setOrigin(0, 0)
                    .setDepth(3)
                    .setInteractive()
                    .setAlpha(0.1)
                    .on("pointerdown", () => {
                        this.changeAudioButton(volumeType, buttonNum);
                    });

                audioButtonRow.push(audioButton);
            }
            // Save 2d array of buttons (3 x 5)
            this.audio.audioButtons.push(audioButtonRow);
        }
        // Hide audio page on startup
        this.showAudioSettings(false);

        // Quests
        this.quests.panel = this.add
            .image(548, 208, "quests-panel")
            .setOrigin(0, 0)
            .setDepth(1);
        this.quests.button = this.add
            .image(592, 168, "quests-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive();

        // Quest text
        // TODO: show all quests
        this.killQuestText = this.add.text(555, 256, "", { fill: "white" }).setDepth(3);

        this.quests.button.on("pointerdown", () => {
            this.showQuests(true);
        });

        // Set and hide quests on startup
        this.updateKillQuestText();
        this.showQuests(false);

        // Equipment
        this.equipment.panel = this.add
            .image(548, 204, "equipment-panel")
            .setOrigin(0, 0)
            .setDepth(1);
        this.equipment.button = this.add
            .image(659, 168, "equipment-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive()
            .on("pointerdown", () => {
                this.showEquipment(true);

                this.equipment.obj.showEquipment(true);
            });

        // Clear out and reinstantiate equipment
        if (Object.entries(this.equipment.obj).length) {
            this.equipment.obj.destroy();
        }
        this.equipment.obj = new Equipment(this, this.characterData.equipment);
        this.showEquipment(false);

        // Clan chat
        this.clan.panel = this.add
            .image(550, 204, "clan-panel")
            .setOrigin(0, 0)
            .setDepth(1);
        this.clan.button = this.add
            .image(522, 466, "clan-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive()
            .on("pointerdown", () => {
                this.showClanChat(true);
            });

        // Add scrollable window for clan members
        this.clan.scrollWindow = new ScrollWindow("clans");
        this.scene.add("scroll-window", this.clan.scrollWindow, true, this.characterData);

        // Clear out and reinstatiate clan members
        if (Object.entries(this.clan.obj).length) {
            this.clan.obj.destroy();
        }
        this.clan.obj = new Clan(this, this.clan.scrollWindow);
        this.showClanChat(false);

        // Scene destructor
        this.events.on("shutdown", () => {
            this.scene.remove(this.clan.scrollWindow.name);
        });
    }

    showSkills(isVisible) {
        if (isVisible) {
            this.hideAllMenus();
            this.skills.button.setAlpha(1);
            this.currentPanel = CONSTANTS.PANEL.SKILLS;
        } else {
            this.skills.button.setAlpha(0.1);
        }

        // Show panel and all skill text
        this.skills.panel.visible = isVisible;
        this.attackText.visible = isVisible;
        this.attackBottomText.visible = isVisible;
        this.rangedText.visible = isVisible;
        this.rangedBottomText.visible = isVisible;
        this.prayerText.visible = isVisible;
        this.prayerBottomText.visible = isVisible;
        this.magicText.visible = isVisible;
        this.magicBottomText.visible = isVisible;
        this.totalLevelText.visible = isVisible;
        this.woodcuttingText.visible = isVisible;
        this.woodcuttingBottomText.visible = isVisible;
    }

    showPrayer(isVisible) {
        if (isVisible) {
            this.hideAllMenus();
            this.prayer.button.setAlpha(1);
            this.currentPanel = CONSTANTS.PANEL.PRAYER;
        } else {
            this.prayer.button.setAlpha(0.1);
        }

        // Show/hide panel
        this.prayer.panel.visible = isVisible;
        this.prayer.curPrayerText.visible = isVisible;
        this.prayer.maxPrayerText.visible = isVisible;
    }

    showEquipment(isVisible) {
        if (isVisible) {
            this.hideAllMenus();
            this.equipment.button.setAlpha(1);
            this.currentPanel = CONSTANTS.PANEL.EQUIPMENT;
        } else {
            this.equipment.button.setAlpha(0.1);
        }

        this.equipment.panel.visible = isVisible;
    }

    showAudioSettings(isVisible) {
        if (isVisible) {
            this.hideAllMenus();
            this.currentPanel = CONSTANTS.PANEL.SETTINGS;
            this.audio.audioPageButton.setAlpha(1);

            // Show current volume buttons
            this.characterData.audio.forEach((volume, volumeType) => {
                this.audio.audioButtons[volumeType][volume].setAlpha(1);
            });
        } else {
            this.audio.audioPageButton.setAlpha(0.1);
        }

        this.audio.audioPage.visible = isVisible;
        this.audio.sliders.forEach((slider) => {
            slider.visible = isVisible;
        });
        this.audio.audioButtons.forEach((buttonRow) => {
            buttonRow.forEach((button) => {
                button.visible = isVisible;
            });
        });
    }

    showQuests(isVisible) {
        if (isVisible) {
            this.hideAllMenus();
            this.quests.button.setAlpha(1);
            this.currentPanel = CONSTANTS.PANEL.QUESTS;
        } else {
            this.quests.button.setAlpha(0.1);
        }

        // Show panel and quest text
        this.quests.panel.visible = isVisible;
        this.killQuestText.visible = isVisible;
    }

    showClanChat(isVisible) {
        if (isVisible) {
            this.hideAllMenus();
            this.clan.button.setAlpha(1);
            this.currentPanel = CONSTANTS.PANEL.CLAN;
        } else {
            this.clan.button.setAlpha(0.1);
        }

        this.clan.obj.show(isVisible);
        this.clan.panel.visible = isVisible;
    }

    // Hide old button and show new one
    changeAudioButton(volumeType, buttonNum) {
        for (let button in this.audio.audioButtons[volumeType]) {
            this.audio.audioButtons[volumeType][button].setAlpha(0.1);
        }
        this.audio.audioButtons[volumeType][buttonNum].setAlpha(1);

        this.audio.scene.changeVolume(volumeType, buttonNum);
    }

    hideAllMenus() {
        this.showAudioSettings(false);
        this.showSkills(false);
        this.showPrayer(false);
        this.showQuests(false);
        this.showEquipment(false);
        this.showClanChat(false);
        this.equipment.obj.showEquipment(false);
        this.inventory.obj.showInventory(false);
        this.inventory.button.setAlpha(1); // Unselected inventory icon
    }

    updateSkillsText() {
        if (this.scene.isActive()) {
            let totalLevel = 0;

            // Attack
            let level = calcLevel(this.characterData.skills.attack);
            this.attackText.text = level;
            this.attackBottomText.text = level;
            totalLevel += level;

            // Ranged
            level = calcLevel(this.characterData.skills.ranged);
            this.rangedText.text = level;
            this.rangedBottomText.text = level;
            totalLevel += level;

            // Prayer
            level = calcLevel(this.characterData.skills.prayer);
            this.prayerText.text = level;
            this.prayerBottomText.text = level;
            this.prayerHotbarText.text = level;
            this.prayer.curPrayerText.text = level;
            this.prayer.maxPrayerText.text = level;
            totalLevel += level;

            // Magic
            level = calcLevel(this.characterData.skills.magic);
            this.magicText.text = level;
            this.magicBottomText.text = level;
            totalLevel += level;

            // Woodcutting
            level = calcLevel(this.characterData.skills.woodcutting);
            this.woodcuttingText.text = level;
            this.woodcuttingBottomText.text = level;
            totalLevel += level;

            this.totalLevelText.text = totalLevel;
        } else {
            // If called before load, update once loaded
            this.events.once("create", () => {
                this.updateSkillsText();
            });
        }
    }

    updateKillQuestText() {
        this.killQuestText.text = "";
        this.currentScene.targets.forEach((enemy, index) => {
            // Add text
            // TODO: Since there are currently no quests for tree levels those
            // will show up as undefined/undefined
            this.killQuestText.text +=
                this.characterData[this.currentScene.currentLevel].enemiesKilled[
                    enemy.varName
                ] +
                "/" +
                this.currentScene.killQuest +
                " " +
                enemy.name +
                "s";

            // Check to see if there are multiple enemies
            if (index + 1 < this.currentScene.targetMetaData.length) {
                this.killQuestText.text += "\n";
            }
        });

        // Add quest complete text
        if (this.characterData[this.currentScene.currentLevel].questCompleted) {
            this.killQuestText.text += "\n\nQuest Complete!";
        }
    }
}
