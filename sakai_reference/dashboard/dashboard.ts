import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StatsWidget } from './components/statswidget';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PanelModule } from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface JoinRequest {
    id: number;
    firstName: string;
    lastName: string;
    personalNumber: string;
    email: string;
    phone: string;
    motivation: string;
    submittedDate: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface Pad {
    id: number;
    name: string;
    url: string;
    safeUrl?: SafeResourceUrl;
    description?: string;
    createdDate: string;
}

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, DialogModule, DividerModule, InputTextModule, TextareaModule, PanelModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `   
        <p-confirmDialog />
        
        <div class="grid grid-cols-12 gap-8">     
            
            <!-- Collaboration Pads Accordion -->
            <div class="col-span-12" *ngIf="pads.length > 0">
                <div class="card">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-0 m-0 mb-2">Collaboration Pads</h2>
                            <p class="text-muted-color text-sm m-0">Manage and access your collaborative workspaces</p>
                        </div>
                    </div>
                    
                    <div *ngFor="let pad of pads; let i = index" class="mb-4">
                        <p-panel [header]="pad.name" [toggleable]="true" [collapsed]="true">
                            <div class="pt-4">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex-1">
                                        <p class="text-muted-color text-sm m-0 mb-2">{{ pad.description || 'Collaborative workspace' }}</p>
                                        <small class="text-muted-color">Created: {{ pad.createdDate }}</small>
                                    </div>
                                    <div class="flex gap-2">
                                        <p-button 
                                            icon="pi pi-external-link" 
                                            [text]="true" 
                                            [rounded]="true" 
                                            size="small"
                                            severity="secondary" 
                                            pTooltip="Open in new tab"
                                            (onClick)="openPadInNewTab(pad.url)"
                                        />
                                        <p-button 
                                            icon="pi pi-pencil" 
                                            [text]="true" 
                                            [rounded]="true" 
                                            size="small"
                                            severity="info" 
                                            pTooltip="Edit pad"
                                            (onClick)="openEditPadDialog(pad)"
                                        />
                                        <p-button 
                                            icon="pi pi-trash" 
                                            [text]="true" 
                                            [rounded]="true" 
                                            size="small"
                                            severity="danger" 
                                            pTooltip="Delete pad"
                                            (onClick)="confirmDeletePad(pad)"
                                        />
                                    </div>
                                </div>
                                
                                <div class="border-2 border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden shadow-sm">
                                    <iframe 
                                        [src]="pad.safeUrl"
                                        width="100%" 
                                        height="600px" 
                                        frameborder="0"
                                        class="block"
                                        [title]="pad.name">
                                    </iframe>
                                </div>
                            </div>
                        </p-panel>
                    </div>
                </div>
            </div>
            
            <!-- Add Pad Button -->
            <div class="col-span-12" *ngIf="pads.length === 0">
                <div class="card text-center py-12">
                    <i class="pi pi-plus-circle text-6xl text-muted-color mb-4"></i>
                    <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">No Collaboration Pads</h3>
                    <p class="text-muted-color mb-4">Add your first collaboration pad to get started</p>
                    <p-button label="Add Pad" icon="pi pi-plus" (onClick)="openAddPadDialog()" />
                </div>
            </div>
            
            <!-- Floating Add Button (when pads exist) -->
            <div class="col-span-12" *ngIf="pads.length > 0">
                <div class="flex justify-center">
                    <p-button 
                        label="Add Pad" 
                        icon="pi pi-plus" 
                        severity="secondary" 
                        [outlined]="true"
                        (onClick)="openAddPadDialog()"
                    />
                </div>
            </div>
            
            <!-- Join Requests Section -->
            <div class="col-span-12">
                <div class="card">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-0 m-0 mb-2">Membership Requests</h2>
                            <p class="text-muted-color text-sm m-0">Review and approve new member applications</p>
                        </div>
                        <p-tag [value]="getPendingCount() + ' Pending'" severity="warn"></p-tag>
                    </div>
                    
                    <p-table [value]="joinRequests" [paginator]="true" [rows]="10" [tableStyle]="{ 'min-width': '60rem' }">
                        <ng-template #header>
                            <tr>
                                <th>Name</th>
                                <th>Personal Number</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-request>
                            <tr>
                                <td>
                                    <div class="font-semibold">{{ request.firstName }} {{ request.lastName }}</div>
                                </td>
                                <td>{{ request.personalNumber }}</td>
                                <td>{{ request.email }}</td>
                                <td>{{ request.phone }}</td>
                                <td>{{ request.submittedDate }}</td>
                                <td>
                                    <p-tag 
                                        [value]="request.status" 
                                        [severity]="getStatusSeverity(request.status)"
                                    ></p-tag>
                                </td>
                                <td>
                                    <div class="flex gap-2">
                                        <p-button 
                                            icon="pi pi-eye" 
                                            [text]="true" 
                                            [rounded]="true"
                                            severity="secondary"
                                            (onClick)="viewRequest(request)"
                                        ></p-button>
                                        <p-button 
                                            *ngIf="request.status === 'pending'"
                                            icon="pi pi-check" 
                                            [text]="true" 
                                            [rounded]="true"
                                            severity="success"
                                            (onClick)="approveRequest(request)"
                                        ></p-button>
                                        <p-button 
                                            *ngIf="request.status === 'pending'"
                                            icon="pi pi-times" 
                                            [text]="true" 
                                            [rounded]="true"
                                            severity="danger"
                                            (onClick)="rejectRequest(request)"
                                        ></p-button>
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
            
        </div>
        
        <!-- Add/Edit Pad Dialog -->
        <p-dialog [(visible)]="addPadDialogVisible" [header]="padDialogMode === 'add' ? 'Add Collaboration Pad' : 'Edit Collaboration Pad'" [modal]="true" [style]="{width: '40rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="padName" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Pad Name *</label>
                    <input 
                        pInputText 
                        id="padName" 
                        [(ngModel)]="newPad.name" 
                        placeholder="e.g., Meeting Notes, Project Planning"
                        class="w-full" 
                        required
                    />
                </div>
                
                <div>
                    <label for="padUrl" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">URL *</label>
                    <input 
                        pInputText 
                        id="padUrl" 
                        [(ngModel)]="newPad.url" 
                        placeholder="https://example.com/pad"
                        class="w-full" 
                        required
                    />
                    <small class="text-muted-color">Enter the full URL of the collaboration pad (e.g., Etherpad, Google Docs, etc.)</small>
                </div>
                
                <div>
                    <label for="padDescription" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea 
                        pInputTextarea 
                        id="padDescription" 
                        [(ngModel)]="newPad.description" 
                        placeholder="Brief description of the pad's purpose"
                        [rows]="3" 
                        class="w-full"
                    ></textarea>
                </div>
                
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div class="flex items-start gap-2">
                        <i class="pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-400 mt-0.5"></i>
                        <div>
                            <p class="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">Important Note</p>
                            <p class="text-xs text-yellow-700 dark:text-yellow-300">
                                Some websites may not allow embedding in iframes due to security policies. 
                                If the pad doesn't load, try opening it in a new tab using the external link button.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="cancelPadDialog()" />
                <p-button [label]="padDialogMode === 'add' ? 'Add Pad' : 'Update Pad'" [disabled]="!newPad.name || !newPad.url" (onClick)="savePad()" />
            </div>
        </p-dialog>
        
        <!-- View Request Dialog -->
        <p-dialog [(visible)]="viewDialogVisible" [header]="selectedRequest ? selectedRequest.firstName + ' ' + selectedRequest.lastName : 'Request Details'" [modal]="true" [style]="{width: '50rem'}" appendTo="body">
            <div *ngIf="selectedRequest" class="flex flex-col gap-4">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label class="block text-muted-color text-sm mb-1">First Name</label>
                        <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedRequest.firstName }}</div>
                    </div>
                    
                    <div class="col-span-6">
                        <label class="block text-muted-color text-sm mb-1">Last Name</label>
                        <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedRequest.lastName }}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label class="block text-muted-color text-sm mb-1">Personal Number</label>
                        <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedRequest.personalNumber }}</div>
                    </div>
                    
                    <div class="col-span-6">
                        <label class="block text-muted-color text-sm mb-1">Status</label>
                        <p-tag 
                            [value]="selectedRequest.status" 
                            [severity]="getStatusSeverity(selectedRequest.status)"
                        ></p-tag>
                    </div>
                </div>
                
                <div>
                    <label class="block text-muted-color text-sm mb-1">Email</label>
                    <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedRequest.email }}</div>
                </div>
                
                <div>
                    <label class="block text-muted-color text-sm mb-1">Phone Number</label>
                    <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedRequest.phone }}</div>
                </div>
                
                <div>
                    <label class="block text-muted-color text-sm mb-1">Submitted Date</label>
                    <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedRequest.submittedDate }}</div>
                </div>
                
                <p-divider></p-divider>
                
                <div>
                    <label class="block text-muted-color text-sm mb-2">Motivation</label>
                    <div class="text-surface-700 dark:text-surface-300 leading-relaxed p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        {{ selectedRequest.motivation }}
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Close" severity="secondary" (onClick)="viewDialogVisible = false" />
                <p-button 
                    *ngIf="selectedRequest?.status === 'pending'"
                    label="Reject" 
                    severity="danger" 
                    icon="pi pi-times"
                    (onClick)="selectedRequest && rejectRequest(selectedRequest); viewDialogVisible = false" 
                />
                <p-button 
                    *ngIf="selectedRequest?.status === 'pending'"
                    label="Approve" 
                    severity="success" 
                    icon="pi pi-check"
                    (onClick)="selectedRequest && approveRequest(selectedRequest); viewDialogVisible = false" 
                />
            </div>
</p-dialog>
    `
})
export class Dashboard {
    viewDialogVisible = false;
    selectedRequest: JoinRequest | null = null;
    
    // Pad-related properties
    addPadDialogVisible = false;
    padDialogMode: 'add' | 'edit' = 'add';
    currentEditingPad: Pad | null = null;
    pads: Pad[] = [
        {
            id: 1,
            name: 'FLOSSK Meeting Notes',
            url: 'https://etherpad.wikimedia.org/p/FLOSSK12NOV2025',
            description: 'Live collaborative document for meeting notes and discussions',
            createdDate: 'Dec 10, 2025'
        }
    ];
    newPad: Omit<Pad, 'id' | 'createdDate'> = {
        name: '',
        url: '',
        description: ''
    };

    joinRequests: JoinRequest[] = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            personalNumber: '123456789',
            email: 'john.doe@email.com',
            phone: '+383 44 123 456',
            motivation: 'I am deeply passionate about technology and open-source software. I have been following FLOSSK for the past year and am impressed by the community\'s dedication to promoting free software in Kosovo. I would love to contribute my programming skills and help organize workshops for students. I believe in the power of community-driven development and want to be part of this movement.',
            submittedDate: 'Dec 5, 2025',
            status: 'pending'
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            personalNumber: '987654321',
            email: 'jane.smith@email.com',
            phone: '+383 45 234 567',
            motivation: 'As a computer science student at University of Prishtina, I am eager to gain practical experience in software development and contribute to meaningful projects. FLOSSK represents everything I believe in - collaboration, knowledge sharing, and building technology that serves the community. I have experience with Python and web development, and I am excited to learn from experienced members while contributing to ongoing projects.',
            submittedDate: 'Dec 6, 2025',
            status: 'pending'
        },
        {
            id: 3,
            firstName: 'Alex',
            lastName: 'Johnson',
            personalNumber: '456789123',
            email: 'alex.johnson@email.com',
            phone: '+383 49 345 678',
            motivation: 'I am a hardware enthusiast and maker who loves building IoT devices and working with Arduino and Raspberry Pi. I have heard great things about FLOSSK\'s makerspace and would love to access the equipment while also sharing my knowledge with other members. I am particularly interested in teaching workshops on electronics and 3D printing. I believe FLOSSK is the perfect place to collaborate on innovative hardware projects.',
            submittedDate: 'Dec 4, 2025',
            status: 'approved'
        },
        {
            id: 4,
            firstName: 'Maria',
            lastName: 'Garcia',
            personalNumber: '789123456',
            email: 'maria.garcia@email.com',
            phone: '+383 48 456 789',
            motivation: 'I am a graphic designer interested in contributing to open-source design projects. I have experience with GIMP, Inkscape, and Blender, and I want to help create visual materials for FLOSSK events and campaigns. I am also passionate about teaching others about open-source design tools and would love to organize design workshops for the community.',
            submittedDate: 'Dec 3, 2025',
            status: 'rejected'
        },
        {
            id: 5,
            firstName: 'David',
            lastName: 'Brown',
            personalNumber: '321654987',
            email: 'david.brown@email.com',
            phone: '+383 44 567 890',
            motivation: 'As a recent graduate in electrical engineering, I am looking for opportunities to apply my skills in real-world projects. FLOSSK\'s focus on open hardware and collaborative development aligns perfectly with my values. I have worked on several robotics projects during my studies and would love to contribute to FLOSSK\'s robotics initiatives. I am also interested in mentoring younger students who are new to electronics and programming.',
            submittedDate: 'Dec 7, 2025',
            status: 'pending'
        }
    ];

    constructor(
        private sanitizer: DomSanitizer, 
        private confirmationService: ConfirmationService
    ) {
        // Initialize safe URLs for existing pads
        this.pads.forEach(pad => {
            pad.safeUrl = this.getSafeUrl(pad.url);
        });
    }

    getSafeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    getPendingCount(): number {
        return this.joinRequests.filter(r => r.status === 'pending').length;
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warn';
            case 'rejected': return 'danger';
            default: return 'warn';
        }
    }

    viewRequest(request: JoinRequest) {
        this.selectedRequest = request;
        this.viewDialogVisible = true;
    }

    approveRequest(request: JoinRequest) {
        request.status = 'approved';
    }

    rejectRequest(request: JoinRequest) {
        request.status = 'rejected';
    }
    
    // Pad management methods
    openAddPadDialog() {
        this.padDialogMode = 'add';
        this.currentEditingPad = null;
        this.newPad = {
            name: '',
            url: '',
            description: ''
        };
        this.addPadDialogVisible = true;
    }
    
    openEditPadDialog(pad: Pad) {
        this.padDialogMode = 'edit';
        this.currentEditingPad = pad;
        this.newPad = {
            name: pad.name,
            url: pad.url,
            description: pad.description || ''
        };
        this.addPadDialogVisible = true;
    }
    
    cancelPadDialog() {
        this.addPadDialogVisible = false;
        this.padDialogMode = 'add';
        this.currentEditingPad = null;
        this.newPad = {
            name: '',
            url: '',
            description: ''
        };
    }

    confirmDeletePad(pad: Pad) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the pad "${pad.name}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.removePad(pad);
            }
        });
    }
    
    savePad() {
        if (!this.newPad.name || !this.newPad.url) {
            return;
        }
        
        // Ensure URL has proper protocol
        let url = this.newPad.url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        if (this.padDialogMode === 'add') {
            // Add new pad
            const newId = this.pads.length > 0 ? Math.max(...this.pads.map(p => p.id)) + 1 : 1;
            
            const pad: Pad = {
                id: newId,
                name: this.newPad.name.trim(),
                url: url,
                safeUrl: this.getSafeUrl(url),
                description: this.newPad.description?.trim() || '',
                createdDate: new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })
            };
            
            this.pads.push(pad);
        } else if (this.padDialogMode === 'edit' && this.currentEditingPad) {
            // Edit existing pad
            const padIndex = this.pads.findIndex(p => p.id === this.currentEditingPad!.id);
            if (padIndex !== -1) {
                this.pads[padIndex] = {
                    ...this.pads[padIndex],
                    name: this.newPad.name.trim(),
                    url: url,
                    safeUrl: this.getSafeUrl(url),
                    description: this.newPad.description?.trim() || ''
                };
            }
        }
        
        this.addPadDialogVisible = false;
        this.padDialogMode = 'add';
        this.currentEditingPad = null;
        this.newPad = {
            name: '',
            url: '',
            description: ''
        };
    }
    
    removePad(pad: Pad) {
        this.pads = this.pads.filter(p => p.id !== pad.id);
    }
    
    openPadInNewTab(url: string) {
        window.open(url, '_blank');
    }
}
