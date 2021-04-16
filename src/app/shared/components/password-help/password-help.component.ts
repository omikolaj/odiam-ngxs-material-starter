import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, EventEmitter, Output, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { FlatTreeControl } from '@angular/cdk/tree';
import { PasswordHelp } from 'app/core/models/auth/password-help.model';
import { MatTreeFlattener, MatTreeFlatDataSource, MatTree } from '@angular/material/tree';
import { Subscription, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PasswordRequirementType } from 'app/core/models/auth/password-requirement-type.enum';
import { LogService } from 'app/core/logger/log.service';
import { fadeInAnimation } from 'app/core/core.module';

/**
 * Displays password help and validates users password.
 */
@Component({
	selector: 'odm-password-help',
	templateUrl: './password-help.component.html',
	styleUrls: ['./password-help.component.scss'],
	// has to be default because nothing changes in the template when requirements go from passed to failed.
	changeDetection: ChangeDetectionStrategy.Default,
	animations: [fadeInAnimation]
})
export class PasswordHelpComponent implements OnInit, OnDestroy {
	/**
	 * Password control.
	 */
	@Input() set passwordControl(value: AbstractControl) {
		this._log.debug('passwordControl fired.', this);
		this._passwordControl = value;
		this._subscription.add(this._validateFormPasswordField$(this._passwordControl).subscribe());
	}

	/**
	 * Password control.
	 */
	_passwordControl: AbstractControl;

	/**
	 * Sets up datasource with password requirements.
	 */
	@Input() set passwordRequirements(value: PasswordRequirement[]) {
		this._dataSource.data = value;
	}

	/**
	 * View child of password help component
	 */
	@ViewChild('tree') matTree: MatTree<PasswordRequirement>;

	/**
	 * Event emitter when password help is clicked.
	 */
	@Output() passwordHelpClicked = new EventEmitter<void>();

	/**
	 * Indent of mat-tree-node component.
	 */
	_indent = 0;

	/**
	 * Password length requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordLengthReqMet = false;

	/**
	 * Password uppercase requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordUppercaseReqMet = false;

	/**
	 * Password lowercase requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordLowercaseReqMet = false;

	/**
	 * Password digit requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordDigitReqMet = false;

	/**
	 * Requires user to enter in at least three unique characters.
	 */
	_passwordThreeUniqueCharacterCountReqMet = false;

	/**
	 * Password special character requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordSpecialCharacterReqMet = false;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordNotMatchReqMet = false;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription: Subscription = new Subscription();

	/**
	 * Transformer for password requirement.
	 */
	private _transformer = (node: PasswordRequirement, level: number) => {
		return {
			expandable: !!node.children && node.children.length > 0,
			name: node.name,
			level: level,
			type: node.type
		};
	};

	/**
	 * Tree control of password help component.
	 */
	// eslint-disable-next-line @typescript-eslint/member-ordering
	_treeControl = new FlatTreeControl<PasswordHelp>(
		(node) => node.level,
		(node) => node.expandable
	);

	/**
	 * Tree flattener of password help component.
	 */
	// eslint-disable-next-line @typescript-eslint/member-ordering
	_treeFlattener = new MatTreeFlattener(
		this._transformer,
		(node) => node.level,
		(node) => node.expandable,
		(node) => node.children
	);

	/**
	 * Data source of password help component.
	 */
	// eslint-disable-next-line @typescript-eslint/member-ordering
	_dataSource = new MatTreeFlatDataSource(this._treeControl, this._treeFlattener);

	/**
	 * Determines whether node has children.
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	_hasChild = (_: number, node: PasswordHelp) => node.expandable;

	/**
	 * Creates an instance of password help component.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this._log.trace('Initialized.', this);
	}

	/**
	 * ngOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._log.trace('Destroyed', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler when user expands password help context.
	 */
	_onTogglePasswordHelp(): void {
		this.passwordHelpClicked.emit();
	}

	/**
	 * Whether password requirement was met.
	 * @param node
	 * @returns true if requirement met
	 */
	_passwordRequirementMet(node: PasswordRequirement): boolean {
		switch (node.type) {
			case PasswordRequirementType.Digit:
				return this._passwordDigitReqMet;
			case PasswordRequirementType.LowerCase:
				return this._passwordLowercaseReqMet;
			case PasswordRequirementType.UpperCase:
				return this._passwordUppercaseReqMet;
			case PasswordRequirementType.MinCharsLength:
				return this._passwordLengthReqMet;
			case PasswordRequirementType.SpecialChar:
				return this._passwordSpecialCharacterReqMet;
			case PasswordRequirementType.ThreeUniqueChar:
				return this._passwordThreeUniqueCharacterCountReqMet;
			default:
				this._log.warn('_passwordRequirementMet method passed in node without a valid type property.');
				return false;
		}
	}

	/**
	 * Validates form password field.
	 * @param form
	 * @returns form password field
	 */
	private _validateFormPasswordField$(passwordControl: AbstractControl): Observable<any> {
		return passwordControl.valueChanges.pipe(
			tap((value: string) => {
				if (passwordControl.hasError('number')) {
					this._passwordDigitReqMet = false;
				} else {
					this._passwordDigitReqMet = true;
				}
				if (passwordControl.hasError('uppercase')) {
					this._passwordUppercaseReqMet = false;
				} else {
					this._passwordUppercaseReqMet = true;
				}
				if (passwordControl.hasError('lowercase')) {
					this._passwordLowercaseReqMet = false;
				} else {
					this._passwordLowercaseReqMet = true;
				}
				if (passwordControl.hasError('nonAlphanumeric')) {
					this._passwordSpecialCharacterReqMet = false;
				} else {
					this._passwordSpecialCharacterReqMet = true;
				}
				if (passwordControl.hasError('uniqueChars')) {
					this._passwordThreeUniqueCharacterCountReqMet = false;
				} else {
					this._passwordThreeUniqueCharacterCountReqMet = true;
				}
				if ((value || '').length === 0 || passwordControl.hasError('minlength')) {
					this._passwordLengthReqMet = false;
				} else if (passwordControl.hasError('minlength') === false) {
					this._passwordLengthReqMet = true;
				}
			})
		);
	}
}
