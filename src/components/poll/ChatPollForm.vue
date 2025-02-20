<template>
	<div class="chatpollform">
		<div class="dimmer" ref="dimmer" @click="close()"></div>
		<div class="holder" ref="holder">
			<div class="head">
				<span class="title">Create chat poll</span>
				<Button :icon="require('@/assets/icons/cross_white.svg')" @click="close()" class="close" bounce/>
			</div>
			<div class="content">
				<div class="description">
					<p>Let your viewers decide the poll's entries by entering a command followed by their entry and randomly pick one of them.</p>
					<p class="example">Ex: <span>{{example}} user entry</span></p>
				</div>
				<form  @submit.prevent="submitChatPoll()">
					<div class="row">
						<ParamItem :paramData="command" />
					</div>

					<div class="row">
						<ParamItem :paramData="duration" />
					</div>

					<div class="row">
						<ParamItem :paramData="multiAnswers" />
					</div>

					<!-- <ToggleBlock small title="Permissions" :open="false" class="row permissions">
						<OBSPermissions
							v-model:mods="permissions.mods"
							v-model:vips="permissions.vips"
							v-model:subs="permissions.subs"
							v-model:all="permissions.all"
							v-model:users="permissions.users" />
					</ToggleBlock> -->

					<div class="row">
						<Button title="Submit" type="submit" :disabled="command.value.length < 1" />
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store, { ChatPollData, ParameterData } from '@/store';
import gsap from 'gsap/all';
import { Options, Vue } from 'vue-class-component';
import Button from '../Button.vue';
import OBSPermissions from '../params/contents/obs/OBSPermissions.vue';
import ParamItem from '../params/ParamItem.vue';
import ToggleBlock from '../ToggleBlock.vue';

@Options({
	props:{},
	components:{
		Button,
		ParamItem,
		ToggleBlock,
		OBSPermissions,
	}
})
export default class ChatPollForm extends Vue {
	
	public command:ParameterData = {type:"text", value:"", label:"Command", placeholder:"!poll", maxLength:31};
	public duration:ParameterData = {label:"Poll duration (minutes)", value:2, type:"number", min:1, max:30};
	public multiAnswers:ParameterData = {label:"User can submit multiple entries", value:false, type:"toggle"};
	public permissions = {
		mods:true,
		vips:true,
		subs:true,
		all:true,
		users:"",
	}

	public get example():string {
		if(this.command.value) return this.command.value as string;
		return "!poll";
	}

	public async mounted():Promise<void> {
		gsap.set(this.$refs.holder as HTMLElement, {marginTop:0, opacity:1});
		gsap.to(this.$refs.dimmer as HTMLElement, {duration:.25, opacity:1});
		gsap.from(this.$refs.holder as HTMLElement, {duration:.25, marginTop:-100, opacity:0, ease:"back.out"});
	}

	public async close():Promise<void> {
		gsap.killTweensOf([this.$refs.holder, this.$refs.dimmer]);
		gsap.to(this.$refs.dimmer as HTMLElement, {duration:.25, opacity:0, ease:"sine.in"});
		gsap.to(this.$refs.holder as HTMLElement, {duration:.25, marginTop:-100, opacity:0, ease:"back.in", onComplete:()=> {
			this.$emit('close');
		}});
	}

	public submitChatPoll():void {
		const data:ChatPollData = {
			startTime:Date.now(),
			command:(this.command.value as string).trim(),
			duration:this.duration.value as number,
			allowMultipleAnswers:this.multiAnswers.value as boolean,
			choices:[],
			winners:[],
		}
		store.dispatch("setChatPoll", data);
		this.close();
	}
}
</script>

<style scoped lang="less">
.chatpollform{
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	.modal();

	.content {
		.description {
			text-align: center;
			font-size: .8em;
			margin-bottom: 1em;
			.example {
				margin-top: .5em;
				font-style: italic;
				span {
					border: 1px dashed @mainColor_normal;
					background-color: fade(@mainColor_normal, 15%);
					padding: 2px;
					border-radius: .5em;
				}
			}
		}
		form {
			display: flex;
			flex-direction: column;
			.row {
				margin-top: 10px;
				display: flex;
				flex-direction: column;
				&.permissions {
					margin: auto;
					// max-width: 500px;
				}
				.error {
					margin-top: 5px;
					color: @mainColor_light;
					padding: 5px 10px;
					border-radius: 5px;
					text-align: center;
					background-color: @mainColor_alert;
				}
				:deep(input) {
					width: 100px;
					text-align: center;
				}
			}
		}
	}
}
</style>