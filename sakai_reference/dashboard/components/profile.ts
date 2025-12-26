import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, FormsModule, AvatarModule, ButtonModule, TagModule, ChipModule, BadgeModule, DividerModule, PanelModule, ProgressBarModule, AvatarGroupModule, DialogModule, InputTextModule, TextareaModule, FileUploadModule, SelectModule],
    template: `
        <p-dialog [(visible)]="editDialogVisible" header="Edit Profile" [modal]="true" [style]="{width: '50rem'}" [contentStyle]="{'overflow-y': 'auto'}" appendTo="body" [maximizable]="true">
            <div class="flex flex-col gap-4">
                <!-- Profile Picture Upload -->
                <div class="flex flex-col items-center gap-4 mb-4">
                    <img 
                        [src]="editProfile.picture" 
                        alt="Profile Picture"
                        class="w-32 h-32 object-cover rounded-full border-4 border-surface-200 dark:border-surface-700"
                    >
                    <p-fileupload 
                        mode="basic" 
                        chooseLabel="Change Picture" 
                        accept="image/*"
                        [maxFileSize]="1000000"
                        (onSelect)="onFileSelect($event)"
                        [auto]="true"
                    ></p-fileupload>
                </div>
                
                <p-divider></p-divider>
                
                <!-- Form Fields -->
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="firstName" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">First Name</label>
                        <input pInputText id="firstName" [(ngModel)]="editProfile.firstName" class="w-full" />
                    </div>
                    
                    <div class="col-span-6">
                        <label for="lastName" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Last Name</label>
                        <input pInputText id="lastName" [(ngModel)]="editProfile.lastName" class="w-full" />
                    </div>
                </div>
                
                <div>
                    <label for="email" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Email</label>
                    <input pInputText id="email" [(ngModel)]="editProfile.email" type="email" class="w-full" />
                </div>
                
                <div>
                    <label for="role" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Role</label>
                    <p-select id="role" [(ngModel)]="editProfile.role" [options]="roleOptions" placeholder="Select Role" class="w-full" />
                </div>
                
                <div>
                    <label for="biography" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Biography</label>
                    <textarea pInputTextarea id="biography" [(ngModel)]="editProfile.biography" [rows]="4" class="w-full"></textarea>
                </div>
                
                <div>
                    <label for="phone" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Phone</label>
                    <input pInputText id="phone" [(ngModel)]="editProfile.phone" class="w-full" />
                </div>
                
                <div>
                    <label for="location" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Location</label>
                    <input pInputText id="location" [(ngModel)]="editProfile.location" class="w-full" />
                </div>
                
                <div>
                    <label for="website" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Website</label>
                    <input pInputText id="website" [(ngModel)]="editProfile.website" class="w-full" />
                </div>
                
                <div>
                    <label for="skills" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Skills (comma-separated)</label>
                    <input pInputText id="skills" [(ngModel)]="skillsString" placeholder="e.g. Angular, TypeScript, Python" class="w-full" />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="editDialogVisible = false" />
                <p-button label="Save Changes" (onClick)="saveProfile()" />
            </div>
        </p-dialog>
        
        <div class="grid grid-cols-12 gap-8">
            <!-- Profile Header Card -->
            <div class="col-span-12">
                <div class="card">
                    <div class="flex flex-col lg:flex-row gap-8">
                        <!-- Profile Picture and Status -->
                        <div class="flex flex-col items-center">
                            <!-- Custom Avatar -->
                            <div class="relative inline-block">
                                <img 
                                    [src]="userProfile.picture" 
                                    [alt]="userProfile.firstName + ' ' + userProfile.lastName"
                                    class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-cover rounded-full border-4 border-surface-0 dark:border-surface-900 shadow-lg hover:scale-105 transition-transform duration-300"
                                >
                                <!-- Status Badge -->
                                <div class="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4">
                                    <span 
                                        [class]="userProfile.activity === 'Active' ? 'bg-green-500' : 'bg-red-500'"
                                        class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-4 border-surface-0 dark:border-surface-900 shadow-md"
                                    >
                                        <i [class]="userProfile.activity === 'Active'" class="text-white text-base sm:text-lg md:text-xl"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Profile Information -->
                        <div class="flex-1">
                            <div class="flex flex-col gap-6">
                                <div>
                                    <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                                        {{ userProfile.firstName }} {{ userProfile.lastName }}
                                    </h2>
                                    <p class="text-muted-color mb-2">{{ userProfile.email }}</p>
                                    <div class="flex gap-3">
                                        <a href="/" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-github" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a href="/" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-linkedin" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a href="/" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-twitter" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a href="/" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-link" style="font-size: 1.25rem"></i>
                                        </a>
                                    </div>
                                </div>
                                
                                <div class="flex flex-wrap gap-4">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-calendar text-muted-color"></i>
                                        <span class="text-muted-color">Joined: </span>
                                        <span class="font-semibold">{{ userProfile.dateJoined }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-briefcase text-muted-color"></i>
                                        <span class="text-muted-color">Role: </span>
                                        <span class="font-semibold">{{ userProfile.role }}</span>
                                    </div>
                                </div>
                                
                                <div class="flex gap-2">
                                    <p-button label="Edit" icon="pi pi-pencil" outlined (onClick)="openEditDialog()"></p-button>
                                    <p-button label="Settings" icon="pi pi-cog" severity="secondary" outlined></p-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Information Cards Section -->
            <div class="col-span-12">
                <div class="grid grid-cols-12 gap-8">
                    <!-- Biography Card -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3">
                        <div class="card h-full">
                            <div class="flex items-baseline gap-2 mb-4">
                                <i style="font-size: 1.5rem" class="pi pi-user text-xl text-primary"></i>
                                <h3 class="text-xl font-semibold m-0">Biography</h3>
                            </div>
                            <p-divider></p-divider>
                            <p class="text-surface-700 dark:text-surface-300 leading-relaxed m-0">
                                {{ userProfile.biography }}
                            </p>
                        </div>
                    </div>

                    <!-- Contact Card -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3">
                        <div class="card h-full">
                            <div class="flex items-baseline gap-2 mb-4">
                                <i style="font-size: 1.5rem" class="pi pi-envelope text-xl text-primary"></i>
                                <h3 class="text-xl font-semibold m-0">Contact</h3>
                            </div>
                            <p-divider></p-divider>
                            
                            <div class="flex flex-col gap-4">
                                <div class="flex items-center gap-3">
                                    <i style="font-size: 1.5rem" class="pi pi-phone text-muted-color"></i>
                                    <span class="text-surface-900 dark:text-surface-0">+1 234 567 8900</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i style="font-size: 1.5rem" class="pi pi-map-marker text-muted-color"></i>
                                    <span class="text-surface-900 dark:text-surface-0">San Francisco, CA</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i style="font-size: 1.5rem" class="pi pi-globe text-muted-color"></i>
                                    <span class="text-surface-900 dark:text-surface-0">www.example.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Skills Card -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3">
                        <div class="card h-full">
                            <div class="flex items-baseline gap-2 mb-4">
                                <i style="font-size: 1.5rem" class="pi pi-star text-xl text-primary"></i>
                                <h3 class="text-xl font-semibold m-0">Skills & Expertise</h3>
                            </div>
                            <p-divider></p-divider>
                            <div class="flex flex-wrap gap-2">
                                <p-chip 
                                    *ngFor="let skill of userProfile.skills" 
                                    [label]="skill"
                                    styleClass="bg-primary-100 dark:bg-primary-400/10 text-primary-700 dark:text-primary-400"
                                ></p-chip>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics Card -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3">
                        <div class="card h-full">
                            <div style="font-size: 1.5rem" class="flex items-baseline gap-2 mb-4">
                                <i style="font-size: 1.5rem" class="pi pi-chart-bar text-xl text-primary"></i>
                                <h3 class="text-xl font-semibold m-0">Statistics</h3>
                            </div>
                            <p-divider></p-divider>
                            
                            <div class="flex flex-col gap-6">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="text-muted-color text-sm mb-1">Projects</div>
                                        <div class="text-2xl font-bold text-surface-900 dark:text-surface-0">24</div>
                                    </div>
                                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 3rem; height: 3rem">
                                        <i class="pi pi-folder text-blue-500 text-xl"></i>
                                    </div>
                                </div>

                                <p-divider></p-divider>

                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="text-muted-color text-sm mb-1">Contributions</div>
                                        <div class="text-2xl font-bold text-surface-900 dark:text-surface-0">156</div>
                                    </div>
                                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 3rem; height: 3rem">
                                        <i class="pi pi-code text-green-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Projects Section -->
            <div class="col-span-12">
                <div class="card">
                    <div class="flex items-baseline gap-2 mb-6">
                        <i style="font-size: 1.5rem" class="pi pi-folder text-2xl text-primary"></i>
                        <h3 class="text-2xl font-semibold m-0">My Projects</h3>
                    </div>
                    
                    <div class="grid grid-cols-12 gap-4">
                        <div *ngFor="let project of userProjects" class="col-span-12 md:col-span-6 lg:col-span-4">
                            <div class="border border-surface rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <div class="flex justify-between items-start mb-3">
                                    <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0">
                                        {{ project.name }}
                                    </h4>
                                    <p-tag 
                                        [value]="project.status" 
                                        [severity]="getStatusSeverity(project.status)"
                                    ></p-tag>
                                </div>
                                
                                <p class="text-surface-700 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                    {{ project.description }}
                                </p>
                                
                                <div class="flex items-center gap-2 text-xs text-muted-color mb-3">
                                    <i class="pi pi-user"></i>
                                    <span>{{ project.role }}</span>
                                </div>
                                
                                <div class="mb-3" *ngIf="project.status === 'in-progress'">
                                    <div class="flex justify-between text-xs mb-2">
                                        <span class="text-muted-color">Progress</span>
                                        <span class="font-semibold">{{ project.progress }}%</span>
                                    </div>
                                    <p-progressbar [value]="project.progress" [showValue]="false"></p-progressbar>
                                </div>
                                
                                <p-divider></p-divider>
                                
                                <div class="mt-3">
                                    <p class="text-xs text-muted-color mb-2">Team</p>
                                    <p-avatargroup>
                                        <p-avatar 
                                            *ngFor="let member of project.team.slice(0, 3)" 
                                            [image]="member.avatar" 
                                            shape="circle"
                                            size="normal"
                                        ></p-avatar>
                                        <p-avatar 
                                            *ngIf="project.team.length > 3"
                                            [label]="'+' + (project.team.length - 3)" 
                                            shape="circle"
                                            size="normal"
                                            [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)'}"
                                        ></p-avatar>
                                    </p-avatargroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Profile {
    editDialogVisible = false;
    editProfile: any = {};
    skillsString = '';
    
    roleOptions = [
        { label: 'Member', value: 'Member' },
        { label: 'Board Member', value: 'Board Member' },
        { label: 'Admin', value: 'Admin' }
    ];
    
    userProfile = {
        picture: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
        firstName: 'Amy',
        lastName: 'Elsner',
        email: 'amy.elsner@flossk.com',
        dateJoined: 'January 15, 2023',
        activity: 'Online',
        role: 'Board Member',
        biography: 'Passionate software engineer with over 8 years of experience in full-stack development. Specialized in Angular, TypeScript, and cloud technologies. Love contributing to open-source projects and mentoring junior developers. Always eager to learn new technologies and improve code quality.',
        skills: ['Angular', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD', 'Agile'],
        phone: '+1 234 567 8900',
        location: 'San Francisco, CA',
        website: 'www.example.com'
    };

    userProjects = [
        {
            id: 1,
            name: 'Smart Home Automation System',
            description: 'Develop an IoT-based home automation system using Arduino and Raspberry Pi to control lights, temperature, and security.',
            status: 'in-progress',
            role: 'Project Lead',
            progress: 65,
            team: [
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png' },
                { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png' },
                { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' }
            ]
        },
        {
            id: 2,
            name: '3D Printer Upgrade Project',
            description: 'Upgrade existing 3D printers with auto-leveling sensors and improved cooling systems.',
            status: 'in-progress',
            role: 'Contributor',
            progress: 40,
            team: [
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png' },
                { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' }
            ]
        },
        {
            id: 3,
            name: 'Robotics Competition Team',
            description: 'Build and program a robot for the regional robotics competition in March 2026.',
            status: 'completed',
            role: 'Programmer',
            progress: 100,
            team: [
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png' },
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png' }
            ]
        }
    ];

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'info';
            case 'upcoming': return 'warn';
            default: return 'info';
        }
    }
    
    openEditDialog() {
        // Clone the current profile for editing
        this.editProfile = { ...this.userProfile };
        this.skillsString = this.userProfile.skills.join(', ');
        this.editDialogVisible = true;
    }
    
    onFileSelect(event: any) {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.editProfile.picture = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    saveProfile() {
        // Parse skills string into array
        this.editProfile.skills = this.skillsString
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        
        // Update the user profile
        Object.assign(this.userProfile, this.editProfile);
        
        this.editDialogVisible = false;
    }
}
