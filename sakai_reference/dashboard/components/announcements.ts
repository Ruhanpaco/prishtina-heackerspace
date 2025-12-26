import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';

interface Announcement {
    id: number;
    title: string;
    content: string;
    author: string;
    authorAvatar: string;
    date: string;
    category: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    views: number;
}

@Component({
    selector: 'app-announcements',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        AvatarModule,
        DividerModule,
        ConfirmDialogModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule
    ],
    providers: [ConfirmationService],
    template: `
        <p-confirmdialog></p-confirmdialog>
        
        <p-dialog [(visible)]="dialogVisible" [header]="dialogMode === 'add' ? 'New Announcement' : 'Edit Announcement'" [modal]="true" [style]="{width: '50rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body" [maximizable]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="title" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Title</label>
                    <input pInputText id="title" [(ngModel)]="currentAnnouncement.title" class="w-full" />
                </div>
                
                <div>
                    <label for="content" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Content</label>
                    <textarea pInputTextarea id="content" [(ngModel)]="currentAnnouncement.content" [rows]="5" class="w-full"></textarea>
                </div>
                
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="category" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Category</label>
                        <p-select id="category" [(ngModel)]="currentAnnouncement.category" [options]="categoryOptions" placeholder="Select Category" class="w-full" />
                    </div>
                    
                    <div class="col-span-6">
                        <label for="priority" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Priority</label>
                        <p-select id="priority" [(ngModel)]="currentAnnouncement.priority" [options]="priorityOptions" placeholder="Select Priority" class="w-full" />
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="dialogVisible = false" />
                <p-button [label]="dialogMode === 'add' ? 'Create' : 'Save'" (onClick)="saveAnnouncement()" />
            </div>
        </p-dialog>
        
        <p-dialog [(visible)]="viewDialogVisible" [header]="selectedAnnouncement?.title" [modal]="true" [style]="{width: '50rem'}" appendTo="body">
            <div *ngIf="selectedAnnouncement" class="flex flex-col gap-4">
                <!-- Author Info -->
                <div class="flex items-center gap-3 mb-2">
                    <p-avatar [image]="selectedAnnouncement.authorAvatar" shape="circle" size="large"></p-avatar>
                    <div>
                        <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedAnnouncement.author }}</div>
                        <div class="text-sm text-muted-color">{{ selectedAnnouncement.date }}</div>
                    </div>
                </div>
                
                <!-- Tags -->
                <div class="flex items-center gap-2">
                    <p-tag 
                        [value]="selectedAnnouncement.priority.toUpperCase()" 
                        [severity]="getPrioritySeverity(selectedAnnouncement.priority)"
                    ></p-tag>
                    <p-tag [value]="selectedAnnouncement.category"></p-tag>
                    <p-tag icon="pi pi-eye" [value]="selectedAnnouncement.views + ' views'" severity="secondary"></p-tag>
                </div>
                
                <p-divider></p-divider>
                
                <!-- Content -->
                <div class="text-surface-700 dark:text-surface-300 leading-relaxed">
                    {{ selectedAnnouncement.content }}
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Close" severity="secondary" (onClick)="viewDialogVisible = false" />
            </div>
        </p-dialog>
        
        <div class="card">
            <div class="flex justify-end items-center mb-6">
                <p-button label="New Announcement" icon="pi pi-plus" size="small" (onClick)="openAddDialog()"></p-button>
            </div>

            <div class="flex flex-col gap-6">
                <div *ngFor="let announcement of announcements" class="p-4 border border-surface rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <div class="cursor-pointer" (click)="viewAnnouncement(announcement)">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                <div>
                                    <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0 mb-1">
                                        {{ announcement.title }}
                                    </h3>
                                <div class="flex items-center gap-2 text-sm text-muted-color">
                                    <span>{{ announcement.author }}</span>
                                    <span>•</span>
                                    <span>{{ announcement.date }}</span>
                                    <span>•</span>
                                    <span><i class="pi pi-eye"></i> {{ announcement.views }} views</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <p-tag 
                                [value]="announcement.priority.toUpperCase()" 
                                [severity]="getPrioritySeverity(announcement.priority)"
                            ></p-tag>
                            <p-tag [value]="announcement.category"></p-tag>
                        </div>
                        </div>

                        <p class="text-surface-700 dark:text-surface-300 mb-4 leading-relaxed">
                            {{ announcement.content.length > 200 ? announcement.content.substring(0, 200) + '...' : announcement.content }}
                        </p>
                        
                        <span *ngIf="announcement.content.length > 200" class="text-primary text-sm font-semibold">
                            Read more →
                        </span>
                    </div>

                    <p-divider></p-divider>

                    <div class="flex justify-end gap-2 mt-3">
                        <p-button label="Edit" icon="pi pi-pencil" severity="secondary" [text]="true" size="small" (onClick)="openEditDialog(announcement)"></p-button>
                        <p-button label="Delete" icon="pi pi-trash" severity="danger" [text]="true" size="small" (onClick)="confirmDelete(announcement)"></p-button>
                    </div>
                </div>

                <div *ngIf="announcements.length === 0" class="text-center py-8">
                    <i class="pi pi-megaphone text-6xl text-muted-color mb-4"></i>
                    <p class="text-muted-color text-lg">No announcements yet</p>
                    <p-button label="Create First Announcement" icon="pi pi-plus" class="mt-4" (onClick)="openAddDialog()"></p-button>
                </div>
            </div>
        </div>
    `
})
export class Announcements {
    constructor(private confirmationService: ConfirmationService) {}

    dialogVisible = false;
    viewDialogVisible = false;
    dialogMode: 'add' | 'edit' = 'add';
    currentAnnouncement: Announcement = this.getEmptyAnnouncement();
    selectedAnnouncement: Announcement | null = null;
    
    categoryOptions = [
        { label: 'General', value: 'General' },
        { label: 'Events', value: 'Events' },
        { label: 'Updates', value: 'Updates' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Meetings', value: 'Meetings' }
    ];
    
    priorityOptions = [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
    ];

    announcements: Announcement[] = [
        {
            id: 1,
            title: 'Welcome to FLOSSK Community Space!',
            content: 'We are excited to announce the launch of our new community workspace. This is a place where members can collaborate, share ideas, and work on exciting projects together. Make sure to check out all the available resources and tools.',
            author: 'Amy Elsner',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
            date: 'Dec 7, 2025',
            category: 'General',
            priority: 'high',
            views: 245
        },
        {
            id: 2,
            title: 'Upcoming Workshop: Arduino & IoT Development',
            content: 'Join us for an exciting workshop on Arduino and IoT development next Saturday at 2 PM. We will cover basics of circuit design, programming, and how to integrate sensors. All skill levels welcome! Please RSVP by Friday.',
            author: 'Bernardo Dominic',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png',
            date: 'Dec 6, 2025',
            category: 'Events',
            priority: 'urgent',
            views: 189
        },
        {
            id: 3,
            title: 'New Equipment Added to Makerspace',
            content: 'We have added new 3D printers and laser cutting equipment to the makerspace! The equipment is now available for all members. Training sessions will be held this week. Check the schedule and sign up.',
            author: 'Anna Fali',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png',
            date: 'Dec 5, 2025',
            category: 'Updates',
            priority: 'normal',
            views: 156
        },
        {
            id: 4,
            title: 'Maintenance Notice - Network Upgrade',
            content: 'Please be informed that we will be performing network maintenance on December 10th from 10 PM to 2 AM. Internet and some services may be temporarily unavailable during this time. We apologize for any inconvenience.',
            author: 'Elwin Sharvill',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png',
            date: 'Dec 4, 2025',
            category: 'Maintenance',
            priority: 'high',
            views: 98
        },
        {
            id: 5,
            title: 'Community Meeting - December 15th',
            content: 'Our monthly community meeting is scheduled for December 15th at 6 PM. We will discuss ongoing projects, budget updates, and plans for the new year. All members are encouraged to attend and share their ideas.',
            author: 'Asiya Javayant',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png',
            date: 'Dec 3, 2025',
            category: 'Meetings',
            priority: 'normal',
            views: 134
        }
    ];

    getPrioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' {
        switch(priority) {
            case 'urgent': return 'danger';
            case 'high': return 'warn';
            case 'normal': return 'info';
            case 'low': return 'success';
            default: return 'info';
        }
    }

    getEmptyAnnouncement(): Announcement {
        return {
            id: 0,
            title: '',
            content: '',
            author: 'Current User',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            category: 'General',
            priority: 'normal',
            views: 0
        };
    }
    
    openAddDialog() {
        this.dialogMode = 'add';
        this.currentAnnouncement = this.getEmptyAnnouncement();
        this.dialogVisible = true;
    }
    
    openEditDialog(announcement: Announcement) {
        this.dialogMode = 'edit';
        this.currentAnnouncement = { ...announcement };
        this.dialogVisible = true;
    }
    
    saveAnnouncement() {
        if (this.dialogMode === 'add') {
            const maxId = this.announcements.length > 0 
                ? Math.max(...this.announcements.map(a => a.id)) 
                : 0;
            this.currentAnnouncement.id = maxId + 1;
            this.announcements = [this.currentAnnouncement, ...this.announcements];
        } else {
            const index = this.announcements.findIndex(a => a.id === this.currentAnnouncement.id);
            if (index !== -1) {
                this.announcements[index] = this.currentAnnouncement;
            }
        }
        this.dialogVisible = false;
    }

    viewAnnouncement(announcement: Announcement) {
        this.selectedAnnouncement = announcement;
        // Increment view count
        announcement.views++;
        this.viewDialogVisible = true;
    }

    confirmDelete(announcement: Announcement) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${announcement.title}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteAnnouncement(announcement);
            }
        });
    }

    deleteAnnouncement(announcement: Announcement) {
        this.announcements = this.announcements.filter(a => a.id !== announcement.id);
    }
}
