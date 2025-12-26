import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { LayoutService } from '@/layout/service/layout.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8 flex flex-col items-center">  
                            <img class="h-45" [src]="layoutService.isDarkTheme() ? 'assets/images/sorra_logo_dark_mode.png' : 'assets/images/sorra_logo.png'" alt="Sorra">
                            <span class="text-muted-color font-medium">{{ isLoginMode ? 'Log in to continue' : 'Create your account' }}</span>
                        </div>

                        <div>
                            @if (isLoginMode) {
                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                                <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                                <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                                <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                                <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                    <div class="flex items-center">
                                        <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                        <label for="rememberme1">Remember me</label>
                                    </div>
                                    <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                                </div>
                                <p-button label="Log In" styleClass="w-full" routerLink="/"></p-button>
                                
                                <div class="text-center mt-6">
                                    <span class="text-muted-color">Don't have an account yet? </span>
                                    <span class="font-medium cursor-pointer text-primary" (click)="toggleMode()">Sign up</span>
                                </div>
                            } @else {
                                <label for="fullName" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Full Name</label>
                                <input pInputText id="fullName" type="text" placeholder="Full name" class="w-full md:w-120 mb-6" [(ngModel)]="fullName" />

                                <label for="regEmail" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                                <input pInputText id="regEmail" type="text" placeholder="Email address" class="w-full md:w-120 mb-6" [(ngModel)]="email" />

                                <label for="regPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                                <p-password id="regPassword" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-6" [fluid]="true"></p-password>

                                <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirm Password</label>
                                <p-password id="confirmPassword" [(ngModel)]="confirmPassword" placeholder="Confirm password" [toggleMask]="true" styleClass="mb-8" [fluid]="true" [feedback]="false"></p-password>

                                <p-button label="Register" styleClass="w-full" routerLink="/"></p-button>
                                
                                <div class="text-center mt-6">
                                    <span class="text-muted-color">Already have an account? </span>
                                    <span class="font-medium cursor-pointer text-primary" (click)="toggleMode()">Log in</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    isLoginMode: boolean = true;
    
    email: string = '';

    password: string = '';

    checked: boolean = false;

    fullName: string = '';

    confirmPassword: string = '';

    constructor(public layoutService: LayoutService) { }

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
    }
}
