import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
	selector: 'odm-auth-container',
	templateUrl: './auth-container.component.html',
	styleUrls: ['./auth-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerComponent implements OnInit {
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
