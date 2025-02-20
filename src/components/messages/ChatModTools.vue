<template>
	<div class="chatmodtools" @mouseleave="closeToOptions()">
		<img src="@/assets/icons/ban.svg" alt="ban" data-tooltip="Ban" @click.stop="ban()">
		<img src="@/assets/icons/timeout.svg" alt="timeout"
		@click.stop="openToOptions()"
		data-tooltip="Timeout">
		<div class="toOptions" v-if="showToOptions" ref="toOptions" @mouseenter="resetCloseTimeout()">
			<Button @click.stop="timeout(10)" title="10s" small />
			<Button @click.stop="timeout(1800)" title="30m" small />
			<Button @click.stop="timeout(3600)" title="1h" small />
			<Button @click.stop="timeout(3600*12)" title="12h" small />
			<Button @click.stop="timeout(3600*24)" title="1d" small />
			<Button @click.stop="timeout(3600*24*7)" title="1w" small />
		</div>
		<img src="@/assets/icons/trash.svg" alt="trash" data-tooltip="Delete" @click.stop="deleteMessage()">
	</div>
</template>

<script lang="ts">
import IRCClient from '@/utils/IRCClient';
import { IRCEventDataList } from '@/utils/IRCEvent';
import Utils from '@/utils/Utils';
import gsap from 'gsap/all';
import { Options, Vue } from 'vue-class-component';
import Button from '../Button.vue';

@Options({
	props:{
		messageData:Object
	},
	components:{
		Button,
	},
	emits:["deleteMessage", "deleteUser"]
})
export default class ChatModTools extends Vue {
	
	public messageData!:IRCEventDataList.Message;
	public showToOptions:boolean = false;

	private closeTimeout:number = 0;

	public ban():void {
		Utils.confirm("Ban "+this.messageData.tags['display-name'], "Are you sure you want to ban this user ?")
		.then(() => {
		this.$emit('deleteUser', this.messageData);
			IRCClient.instance.sendMessage(`/ban ${this.messageData.tags['display-name']}`);
		})
	}

	public timeout(duration:number):void {
		this.$emit('deleteUser', this.messageData);
		IRCClient.instance.sendMessage(`/timeout ${this.messageData.tags['display-name']} ${duration}`);
	}

	public deleteMessage():void {
		this.$emit('deleteMessage', this.messageData);
		IRCClient.instance.deleteMessage(this.messageData.tags.id as string);
	}

	public async openToOptions():Promise<void> {
		this.showToOptions = true;
		await this.$nextTick();
		const holder = this.$refs.toOptions as HTMLDivElement;
		gsap.from(holder, {width:0, duration:.2, ease:"sin.inOut"});
	}

	public closeToOptions():void {
		this.closeTimeout = setTimeout(() => {
			const holder = this.$refs.toOptions as HTMLDivElement;
			gsap.to(holder, {width:0, duration:.2, ease:"sin.inOut",
			onComplete:()=> {
				this.showToOptions = false;
			}});
		}, 500);
	}

	public resetCloseTimeout():void {
		clearTimeout(this.closeTimeout);
	}
}
</script>

<style scoped lang="less">
.chatmodtools{
	display: flex;
	flex-direction: row;

	img {
		opacity: 0.75;
		height: 1em;
		vertical-align: middle;
		cursor: pointer;
		&:hover {
			opacity: .75;
		}
		&:not(:last-child) {
			margin-right: 5px;
		}
	}

	.toOptions {
		overflow: hidden;
		display: inline-flex;
		flex-direction: row;
		bottom: 0;
		.button {
			margin-right: 1px;
		}
	}
}
</style>