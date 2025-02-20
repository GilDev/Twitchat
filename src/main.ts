import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/all';
import { createApp } from 'vue';
import { NavigationGuardNext, RouteLocation } from 'vue-router';
import App from './App.vue';
import './less/index.less';
import router from './router';
import store from './store';
import { TwitchTypes } from './utils/TwitchUtils';

gsap.registerPlugin(ScrollToPlugin);

let tokenRefreshScheduled = false;

/**
 * Refreshes the oauth token when necessary
 */
async function scheduleTokenRefresh():Promise<void> {
	const expire = (store.state.oAuthToken as TwitchTypes.AuthTokenResult).expires_in;
	let delay = Math.max(0,expire*1000 - 60000 * 5);
	//Refresh at least every 1h
	const maxDelay = 1000 * 60 * 60;
	if(delay > maxDelay) delay = maxDelay;

	console.log("Refresh token in", delay);
	setTimeout(()=>{
		store.dispatch("authenticate", {forceRefresh:true, cb:(success:boolean)=>{
			if(success) {
				scheduleTokenRefresh();
			}else{
				router.push({name: 'login'});
			}
		}});
	}, delay);
}

/**
 * Add route guards for login
 */
router.beforeEach(async (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => {
	const needAuth = to.meta.needAuth;
	const publicRoute = to.meta.public;
	
	if (!store.state.initComplete) {
		try {
			await store.dispatch("startApp");
		}catch(error) {
			console.log(error);
		}
	}

	if (!store.state.authenticated) {
		//Not authenticated, reroute to login
		if(needAuth === true) {
			next({name: 'login'});
		}else{
			next();
		}
		return;
	}
	
	if(!needAuth && publicRoute !== true) {
		//Already authenticated, reroute to home
		next({name: 'chat'});
		return;
	}

	if(needAuth && !tokenRefreshScheduled) {
		tokenRefreshScheduled = true;
		scheduleTokenRefresh();
	}
	next();
});

createApp(App)
.use(store)
.use(router)
.directive('autofocus', {
	mounted(el, binding) {
		if(binding.value !== false) {
			el.focus();
		}
	}
})
.mount('#app')

// (
// 	async () => {
// 		const res = await TwitchUtils.validateToken("xxx");
// 		console.log(res);
// 	}
// )()