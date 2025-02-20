<template>
	<div class="rafflestate">
		<h1 class="title"><img src="@/assets/icons/ticket.svg">Raffle - <span class="highlight">{{raffleData.command}}</span></h1>

		<ProgressBar class="progress"
		:percent="raffleData.users?.length == raffleData.maxUsers && raffleData.maxUsers > 0?  1 : progressPercent"
		:duration="raffleData.users?.length == raffleData.maxUsers && raffleData.maxUsers > 0?  0 : raffleData.duration*60000" />

		<div class="item users">
			<img src="@/assets/icons/user.svg" alt="user">
			<p class="count">{{raffleData.users?.length}}</p>
			<p class="max" v-if="raffleData.maxUsers">/{{raffleData.maxUsers}}</p>
			<p>entered</p>
		</div>
		<div class="item winners" v-if="raffleData.winners.length > 0">
			<span class="title">Winners <span class="count">({{raffleData.winners.length}})</span> :</span>
			<div class="users">
				<span v-for="w in raffleData.winners" :key="w['user-id']" @click="openUserCard(w)">{{w.user['display-name']}}</span>
			</div>
		</div>

		<Button class="item"
			:icon="require('@/assets/icons/ticket.svg')"
			title="Pick a winner"
			@click="pickWinner()"
			:disabled="!raffleData.users || raffleData.users.length == 0 || raffleData.winners.length == raffleData.users.length" />

		<ParamItem class="item postChat" :paramData="postOnChatParam" />

		<Button class="item"
			:icon="require('@/assets/icons/cross_white.svg')"
			title="Stop Raffle"
			highlight
			@click="closeRaffle()" />
	</div>
</template>

<script lang="ts">
import store, { ParameterData, RaffleData, RaffleVote } from '@/store';
import IRCClient from '@/utils/IRCClient';
import { IRCEventDataList } from '@/utils/IRCEvent';
import Utils from '@/utils/Utils';
import { watch } from '@vue/runtime-core';
import gsap from 'gsap/all';
import { ChatUserstate } from 'tmi.js';
import { Options, Vue } from 'vue-class-component';
import Button from '../Button.vue';
import ParamItem from '../params/ParamItem.vue';
import ProgressBar from '../ProgressBar.vue';

@Options({
	props:{},
	components:{
		Button,
		ParamItem,
		ProgressBar,
	},
	emits:["close"]
})
export default class RaffleState extends Vue {

	public progressPercent:number = 0;
	public raffleData:RaffleData = store.state.raffle as RaffleData;
	public postOnChatParam:ParameterData = { label:"Post winner on chat", value:false, type:"toggle"};
	public postOnChatTextParam:ParameterData = { label:"Message ( username => {USER} )", value:"", type:"text", longText:true};

	public mounted():void {
		this.postOnChatTextParam.value	= store.state.raffle_message;
		this.postOnChatParam.value		= store.state.raffle_messageEnabled;
		this.postOnChatParam.children	= [this.postOnChatTextParam];

		const ellapsed = new Date().getTime() - new Date(this.raffleData.created_at).getTime();
		const duration = this.raffleData.duration*60000;
		const timeLeft = duration - ellapsed;
		this.progressPercent = ellapsed/duration;
		gsap.to(this, {progressPercent:1, duration:timeLeft/1000, ease:"linear"});

		watch(()=>this.postOnChatTextParam.value, ()=> this.saveParams())
		watch(()=>this.postOnChatParam.value, ()=> this.saveParams())
	}

	public closeRaffle():void {
		store.dispatch("startRaffle", {});
		this.$emit("close")
	}

	public openUserCard(user:ChatUserstate):void {
		store.dispatch("openUserCard", user.username);
	}

	public pickWinner():void {
		let winner:RaffleVote;
		
		const list = [];
		//Ponderate votes by adding one user many times if her/his
		//score is greater than 1
		for (let i = 0; i < this.raffleData.users.length; i++) {
			const u = this.raffleData.users[i];
			if(u.score==1) list.push(u);
			else {
				for (let j = 0; j < u.score; j++) {
					list.push(u);
				}
			}
		}
		
		do{
			winner = Utils.pickRand(list);
		}while(this.raffleData.winners.find(w => w.user['user-id'] == winner.user['user-id']));

		this.raffleData.winners.push( winner );

		//Post result on chat
		const payload:IRCEventDataList.RaffleResult = {
			type:"raffle",
			data:this.raffleData,
			tags: {
				id:IRCClient.instance.getFakeGuid(),
				"tmi-sent-ts": Date.now().toString()
			},
		}
		store.dispatch("addChatMessage", payload);
		
		if(this.postOnChatParam.value) {
			IRCClient.instance.sendMessage((this.postOnChatTextParam.value as string).replace(/\{USER\}/gi, winner.user['display-name'] as string));
		}
	}

	public saveParams():void {
		store.dispatch("setRaffleMessage", this.postOnChatTextParam.value);
		store.dispatch("setRaffleMessageEnabled", this.postOnChatParam.value);
	}

}
</script>

<style scoped lang="less">
.rafflestate{
	color: @mainColor_light;

	&>.title {
		color: @mainColor_light;
		width: 100%;
		text-align: center;
		padding-bottom: 10px;
		word-break: break-word;
		img {
			width: 20px;
			margin-right: 10px;
		}
		.highlight {
			color: @mainColor_normal;
			background: @mainColor_light;
			padding: 2px 5px;
			border-radius: 5px;
			font-size: .8em;
		}
	}

	.progress {
		margin-bottom: 20px;
	}

	.item {
		margin: auto;
		&:not(:last-child) {
			margin-bottom: 10px;
		}

		&.users {
			display: flex;
			flex-direction: row;
			font-style: italic;
			opacity: .7;
			font-size: 15px;
			.count, .max {
				margin-right: 5px;
			}
			img {
				height: 14px;
				align-self: baseline;
				margin-right: 5px;
			}
		}

		&.postChat {
			width: 70%;
			:deep(label) {
				font-size: 15px;
				align-self: center;
			}
			:deep(.child) {
				width: 100%;
			}
		}

		&.winners {
			display: block;
			margin: auto;
			margin-bottom: 10px;
			background: @mainColor_light;
			padding: 2px 5px;
			border-radius: 5px;
			color: @mainColor_normal;
			max-width: 100%;
			display: flex;
			flex-direction: column;
			.title {
				// flex-grow: 1;
				font-weight: bold;
				align-self: center;
				margin-bottom: 10px;
				.count {
					font-size: .75em;
					font-style: italic;
				}
			}
			.users {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				justify-content: center;
				span {
					cursor: pointer;
					margin-left: 5px;
					text-decoration: underline;
					&:hover {
						color: @mainColor_alert;
						text-decoration: none;
					}
				}
			}
		}
	}
	
}
</style>