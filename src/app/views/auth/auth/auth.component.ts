import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'odm-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit {
	_createAccount: 'right-panel-active' | '';

	_signinForm: FormGroup;
	_signupForm: FormGroup;

	constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {}

	ngOnInit(): void {
		this._initForms();
	}

	private _initForms(): void {
		this._signinForm = this._initSigninForm();
		this._signupForm = this._InitSignupForm();
	}

	private _initSigninForm(): FormGroup {
		return this.fb.group({
			email: this.fb.control(''),
			password: this.fb.control('')
		});
	}

	private _InitSignupForm(): FormGroup {
		return this.fb.group({
			email: this.fb.control(''),
			firstName: this.fb.control(''),
			lastName: this.fb.control(''),
			password: this.fb.control('')
		});
	}

	_onSignup(): void {}

	_onSwitchToSignup(): void {
		console.log('onCreateAccount');
		this._createAccount = 'right-panel-active';
	}

	_onSignin(): void {}

	_onSwitchSignin(): void {
		console.log('onSignIn');
		this._createAccount = '';
	}
}
