<template>
	<div class="chatpollresult" @click.ctrl="copyJSON()">
		<span class="time" v-if="$store.state.params.appearance.displayTime.value">{{time}}</span>
		<img src="@/assets/icons/poll.svg" alt="icon" class="icon">
		<div class="content">
			<div class="title">{{poll.title}}</div>
			<div class="choices">
				<div v-for="o in poll.choices" :key="o.id" class="choice">
					<div class="choiceTitle">{{o.title}}</div>
					<div class="bar" :style="getChoiceStyles(o)">
						<div class="users">
							<img src="@/assets/icons/user.svg" alt="user" class="icon">
							{{o.votes}}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { IRCEventDataList } from '@/utils/IRCEvent';
import { TwitchTypes } from '@/utils/TwitchUtils';
import Utils from '@/utils/Utils';
import { Options, Vue } from 'vue-class-component';

@Options({
	props:{
		pollData:Object
	},
	components:{}
})
export default class ChatPollResult extends Vue {

	public pollData!:IRCEventDataList.PollResult;

	public get poll():TwitchTypes.Poll {
		return this.pollData.data;
	}

	public get time():string {
		const d = new Date(parseInt(this.pollData.tags['tmi-sent-ts'] as string));
		return Utils.toDigits(d.getHours())+":"+Utils.toDigits(d.getMinutes());
	}

	public getChoiceStyles(o:TwitchTypes.PollChoice):{[key:string]:string} {
		let totalVotes = 0;
		if(this.poll) {
			for (let i = 0; i < this.poll.choices.length; i++) {
				totalVotes += this.poll.choices[i].votes;
			}
		}
		const percent = o.votes/Math.max(1,totalVotes);
		return {
			backgroundSize: `${percent * 100}% 100%`,
		};
	}

	public copyJSON():void {
		Utils.copyToClipboard(JSON.stringify(this.pollData));
		console.log(this.pollData);
	}

}
</script>

<style scoped lang="less">
.chatpollresult{
	
	background-color: rgba(255, 255, 255, .15);
	border-radius: 5px;
	margin: 5px 0;
	padding: 5px !important;
	text-align: center;

	display: flex;
	flex-direction: row;
	align-items: center;
	color: #fff;

	&>.icon {
		width: 1.5em;
		height: 1.5em;
		object-fit: contain;
		margin-right: 20px;
	}

	.content {
		flex-grow: 1;
		.title {
			font-weight: bold;
			font-size: 1.2em;
			margin-bottom: 5px;
		}
		.choices {
			display: flex;
			flex-direction: column;
			.choice {
				display: flex;
				flex-direction: row;
				align-items: center;
				margin-bottom: 1px;
				
				.choiceTitle {
					width: 50%;
					padding-right: 10px;
					text-align: right;
					text-overflow: ellipsis;
					overflow: hidden;
					white-space: nowrap;
					// padding: 5px;
					// border-radius: 5px;
					// @c: fade(@mainColor_light, 25%);
					// background-color: fade(@c, 25%);
				}

				.bar {
					flex-grow: 1;
					display: flex;
					flex-direction: row;
					padding: 3px;
					border-radius: 5px;
					@c: fade(@mainColor_light, 25%);
					background: linear-gradient(to right, @c 100%, @c 100%);
					background-color: fade(@c, 20%);
					background-repeat: no-repeat;
					justify-content: space-evenly;

					.users {
						display: flex;
						flex-direction: row;
						align-items: center;
						padding: 5px;
						border-radius: 5px;
						background-color: rgba(0, 0, 0, .25);
						font-size: .8em;

						.icon {
							height: 1em;
							margin-right: 5px;
						}
					}
				}
			}
		}
	}
}
</style>