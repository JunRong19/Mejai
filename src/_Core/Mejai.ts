import { MejaiPlugin } from "@Mejai"
import { waitTill } from "@Mejai"
import { addCSS } from "@Chromium"
import { Elements } from "@Chromium"

declare global {
    interface Window{
        Mejai: Mejai
    }

    interface Promise<T> {
		cancelled: boolean
		cancel: () => void
	}
}

class Mejai {

    private plugins: MejaiPlugin[] = []

    constructor() {
        console.log("Mejai Initialized")
        window.Mejai = this

        waitTill(() => this.isReady()).then(() => {

			this.drawMejaiUI()

			this.getPlugins().forEach(plugin => !plugin.initialized && this.initPlugin(plugin))

		})
    }

	initPlugin(plugin: MejaiPlugin) {
		plugin.initialized = true
		plugin.init()
	}

	addPlugin(plugin: MejaiPlugin) {
		this.plugins.push(plugin)
		if (!plugin.initialized && this.isReady())
			this.initPlugin(plugin)
	}

	getPlugin(name: string) {
		return this.plugins.find(plugin => plugin.name === name)
	}

	getPlugins(): Array<MejaiPlugin> {
		return this.plugins
	}

    private isReady(): boolean {
        return (
            document.readyState === "complete" &&
            document.querySelector('link[rel="riot:plugins:websocket"]')
        ) ? true : false
    }

	private async drawMejaiUI() {
		addCSS(`
		${Elements.HOME_MAIN_VIEW} {
		background: linear-gradient(180deg, #000000ff 0%, rgba(0, 0, 0, 0) 15%) !important;
		}

		${Elements.HOME_SIDEBAR} {
		background: linear-gradient(180deg, #000000ff 0%, #0000007d 15%, rgba(0, 0, 0, 0) 20%) !important;
		}

		// ${Elements.HOME_VERSION_PANEL} {
		// background: black !important;
		// opacity: 1 !important;
		// align-content: center !important;
		// height: 100% !important;
		// display: grid;
		// }`
		)
		
		try {
			const lorLink = await waitTill(() => document.querySelector(Elements.HOME_LOR_LINK), 5000) as HTMLElement;
			lorLink.remove();
		} catch (e) {
			throw new Error("LoR Link element not found. Unable to remove it.");
		}

		try {
			const tftBtn = await waitTill(() => document.querySelector(Elements.HOME_TFT_BTN), 5000) as HTMLElement;
			tftBtn.remove();
		} catch (e) {
			throw new Error("TFT Button element not found. Unable to remove it.");
		}

		try {
			const leagueBtn = await waitTill(() => document.querySelector(Elements.HOME_LEAGUE_BTN), 5000) as HTMLElement;
			leagueBtn.textContent = "Home"
		}catch (e) {
			throw new Error("League Button element not found. Unable to update it.");
		}

		try {
			const sidebarBottomPanel = await waitTill(() => document.querySelector(Elements.HOME_SIDEBAR_BOTTOM_PANEL), 5000) as HTMLElement;
			sidebarBottomPanel.remove();
		}catch (e) {
			throw new Error("Sidebar Bottom Panel element not found. Unable to remove it.");
		}
	}
}

const instance = window.Mejai || new Mejai()
export { instance as Mejai }