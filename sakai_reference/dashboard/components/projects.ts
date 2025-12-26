import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabsModule } from 'primeng/tabs';
import { DragDropModule } from 'primeng/dragdrop';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface Member {
    name: string;
    avatar: string;
    role: string;
}

interface Resource {
    id: number;
    title: string;
    url: string;
    description: string;
    type: 'documentation' | 'tutorial' | 'tool' | 'reference' | 'other';
}

interface Objective {
    id: number;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    assignedTo: Member;
    progress: number;
    members?: Member[];
}

interface Project {
    id: number;
    name: string;
    description: string;
    status: 'upcoming' | 'in-progress' | 'completed';
    startDate: string;
    endDate: string;
    progress: number;
    participants: Member[];
    objectives: Objective[];
    resources?: Resource[];
    githubRepo?: string; // GitHub repository URL for tracking commits
}

interface GitHubCommit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
    html_url: string;
    author?: {
        login: string;
        avatar_url: string;
    };
}

interface GitHubRepo {
    name: string;
    full_name: string;
    html_url: string;
    updated_at: string;
}

@Component({
    selector: 'app-projects',
    imports: [CommonModule, FormsModule, ButtonModule, TagModule, AvatarModule, AvatarGroupModule, DividerModule, ProgressBarModule, TabsModule, DragDropModule, DialogModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule, ConfirmDialogModule, MultiSelectModule, TooltipModule],
    providers: [ConfirmationService],
    template: `
        <p-confirmdialog></p-confirmdialog>
        
        <p-dialog [(visible)]="dialogVisible" [header]="dialogMode === 'add' ? 'New Project' : 'Edit Project'" [modal]="true" [style]="{width: '50rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body" [maximizable]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="projectName" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Project Name</label>
                    <input pInputText id="projectName" [(ngModel)]="currentProject.name" class="w-full" />
                </div>
                
                <div>
                    <label for="description" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea pInputTextarea id="description" [(ngModel)]="currentProject.description" [rows]="4" class="w-full"></textarea>
                </div>
                
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="startDate" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Start Date</label>
                        <p-datepicker id="startDate" [(ngModel)]="startDate" dateFormat="M d, yy" [showIcon]="true" class="w-full" />
                    </div>
                    
                    <div class="col-span-6">
                        <label for="endDate" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">End Date</label>
                        <p-datepicker id="endDate" [(ngModel)]="endDate" dateFormat="M d, yy" [showIcon]="true" class="w-full" />
                    </div>
                </div>
                
                <div>
                    <label for="teamMembers" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Team Members</label>
                    <p-multiselect 
                        id="teamMembers" 
                        [(ngModel)]="selectedMemberNames" 
                        [options]="availableMembers" 
                        optionLabel="name" 
                        optionValue="name"
                        placeholder="Select Team Members" 
                        class="w-full"
                        [showClear]="true"
                        display="chip"
                    />
                </div>
                
                <div *ngIf="dialogMode === 'edit'">
                    <label for="status" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Status</label>
                    <p-select id="status" [(ngModel)]="currentProject.status" [options]="statusOptions" placeholder="Select Status" class="w-full" />
                </div>
                
                <div *ngIf="dialogMode === 'edit' && currentProject.status === 'in-progress'">
                    <label for="progress" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Progress (%)</label>
                    <input pInputText id="progress" [(ngModel)]="currentProject.progress" type="number" min="0" max="100" class="w-full" />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="dialogVisible = false" />
                <p-button [label]="dialogMode === 'add' ? 'Create' : 'Save'" (onClick)="saveProject()" />
            </div>
        </p-dialog>
        
        <p-dialog [(visible)]="objectiveDialogVisible" [header]="objectiveDialogMode === 'add' ? 'New Objective' : 'Edit Objective'" [modal]="true" [style]="{width: '40rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body" [maximizable]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="objectiveTitle" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Title</label>
                    <input pInputText id="objectiveTitle" [(ngModel)]="currentObjective.title" class="w-full" />
                </div>
                
                <div>
                    <label for="objectiveDescription" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea pInputTextarea id="objectiveDescription" [(ngModel)]="currentObjective.description" [rows]="3" class="w-full"></textarea>
                </div>
                
                <div>
                    <label for="objectiveStatus" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Status</label>
                    <p-select id="objectiveStatus" [(ngModel)]="currentObjective.status" [options]="objectiveStatusOptions" placeholder="Select Status" class="w-full" />
                </div>
                
                <div>
                    <label for="objectiveProgress" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Progress (%)</label>
                    <input pInputText id="objectiveProgress" [(ngModel)]="currentObjective.progress" type="number" min="0" max="100" class="w-full" />
                </div>
                
                <div>
                    <label for="objectiveMembers" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Team Members</label>
                    <p-multiSelect id="objectiveMembers" [(ngModel)]="selectedObjectiveMemberNames" [options]="availableMembers" optionLabel="name" optionValue="name" placeholder="Select Team Members" display="chip" class="w-full" />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="objectiveDialogVisible = false" />
                <p-button [label]="objectiveDialogMode === 'add' ? 'Create' : 'Save'" (onClick)="saveObjective()" />
            </div>
        </p-dialog>
        
        <!-- Resource Dialog -->
        <p-dialog [(visible)]="resourceDialogVisible" [header]="resourceDialogMode === 'add' ? 'Add Resource' : 'Edit Resource'" [modal]="true" [style]="{width: '40rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="resourceTitle" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Title</label>
                    <input pInputText id="resourceTitle" [(ngModel)]="currentResource.title" class="w-full" />
                </div>
                
                <div>
                    <label for="resourceUrl" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">URL</label>
                    <input pInputText id="resourceUrl" [(ngModel)]="currentResource.url" placeholder="https://example.com" class="w-full" />
                </div>
                
                <div>
                    <label for="resourceDescription" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea pInputTextarea id="resourceDescription" [(ngModel)]="currentResource.description" [rows]="2" class="w-full"></textarea>
                </div>
                
                <div>
                    <label for="resourceType" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Type</label>
                    <p-select id="resourceType" [(ngModel)]="currentResource.type" [options]="resourceTypeOptions" placeholder="Select Type" class="w-full" />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="resourceDialogVisible = false" />
                <p-button [label]="resourceDialogMode === 'add' ? 'Add' : 'Save'" (onClick)="saveResource()" />
            </div>
        </p-dialog>
        
        <div class="card">
            <div class="flex justify-end items-center mb-6">
                <p-button label="New Project" icon="pi pi-plus" size="small" (onClick)="openAddDialog()"></p-button>
            </div>

            <!-- Kanban-style Board -->
            <div class="grid grid-cols-12 gap-4">
                <!-- Upcoming Column -->
                <div class="col-span-12 md:col-span-4">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4" pDroppable="projects" (onDrop)="onDrop($event, 'upcoming')">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-lg m-0">Upcoming</h3>
                            <p-tag [value]="getProjectsByStatus('upcoming').length.toString()" severity="warn"></p-tag>
                        </div>
                        <div class="flex flex-col gap-3 min-h-32">
                            <div *ngFor="let project of getProjectsByStatus('upcoming')" pDraggable="projects" (onDragStart)="dragStart(project)" (onDragEnd)="dragEnd()" class="bg-surface-0 dark:bg-surface-900 border border-surface rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectProject(project)">
                                <div class="flex justify-between items-start mb-3">
                                    <h4 class="text-base font-semibold text-surface-900 dark:text-surface-0 m-0">
                                        {{ project.name }}
                                    </h4>
                                    <div class="flex justify-content-center align-content-end">
                                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditDialog(project); $event.stopPropagation()" />
                                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteProject(project)" />
                                    </div>
                                </div>

                                <p class="text-surface-700 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                    {{ project.description }}
                                </p>

                                <div class="flex items-center gap-2 text-xs text-muted-color mb-3">
                                    <i class="pi pi-calendar"></i>
                                    <span>Starts {{ project.startDate }}</span>
                                </div>

                                <div class="mb-3">
                                    <p-button 
                                        *ngIf="!isUserMember(project)"
                                        label="Join"
                                        icon="pi pi-user-plus"
                                        size="small"
                                        [outlined]="true"
                                        (onClick)="joinProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                    <p-button 
                                        *ngIf="isUserMember(project)"
                                        label="Leave"
                                        icon="pi pi-user-minus"
                                        size="small"
                                        [outlined]="true"
                                        severity="danger"
                                        (onClick)="leaveProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                </div>

                                <p-divider></p-divider>

                                <div class="mt-3">
                                    <p class="text-xs text-muted-color mb-2">Team</p>
                                    <p-avatargroup>
                                        <p-avatar 
                                            *ngFor="let member of project.participants.slice(0, 3)" 
                                            [image]="member.avatar" 
                                            shape="circle"
                                            size="normal"
                                        ></p-avatar>
                                        <p-avatar 
                                            *ngIf="project.participants.length > 3"
                                            [label]="'+' + (project.participants.length - 3)" 
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

                <!-- In Progress Column -->
                <div class="col-span-12 md:col-span-4">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4" pDroppable="projects" (onDrop)="onDrop($event, 'in-progress')">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-lg m-0">In Progress</h3>
                            <p-tag [value]="getProjectsByStatus('in-progress').length.toString()" severity="info"></p-tag>
                        </div>
                        <div class="flex flex-col gap-3 min-h-32">
                            <div *ngFor="let project of getProjectsByStatus('in-progress')" pDraggable="projects" (onDragStart)="dragStart(project)" (onDragEnd)="dragEnd()" class="bg-surface-0 dark:bg-surface-900 border border-surface rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectProject(project)">
                                <div class="flex justify-between items-start mb-3">
                                    <h4 class="text-base font-semibold text-surface-900 dark:text-surface-0 m-0">
                                        {{ project.name }}
                                    </h4>
                                    <div class="flex justify-content-center align-content-end">
                                    <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditDialog(project); $event.stopPropagation()" />
                                    <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteProject(project)" />
                                    </div>
                                </div>

                                <p class="text-surface-700 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                    {{ project.description }}
                                </p>

                                <div class="mb-3">
                                    <div class="flex justify-between text-xs mb-2">
                                        <span class="text-muted-color">Progress</span>
                                        <span class="font-semibold">{{ project.progress }}%</span>
                                    </div>
                                    <p-progressbar [value]="project.progress" [showValue]="false"></p-progressbar>
                                </div>

                                <div class="mb-3">
                                    <p-button 
                                        *ngIf="!isUserMember(project)"
                                        label="Join"
                                        icon="pi pi-user-plus"
                                        size="small"
                                        [outlined]="true"
                                        (onClick)="joinProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                    <p-button 
                                        *ngIf="isUserMember(project)"
                                        label="Leave"
                                        icon="pi pi-user-minus"
                                        size="small"
                                        [outlined]="true"
                                        severity="danger"
                                        (onClick)="leaveProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                </div>

                                <p-divider></p-divider>

                                <div class="mt-3">
                                    <p class="text-xs text-muted-color mb-2">Team</p>
                                    <p-avatargroup>
                                        <p-avatar 
                                            *ngFor="let member of project.participants.slice(0, 3)" 
                                            [image]="member.avatar" 
                                            shape="circle"
                                            size="normal"
                                        ></p-avatar>
                                        <p-avatar 
                                            *ngIf="project.participants.length > 3"
                                            [label]="'+' + (project.participants.length - 3)" 
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

                <!-- Completed Column -->
                <div class="col-span-12 md:col-span-4">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4" pDroppable="projects" (onDrop)="onDrop($event, 'completed')">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-lg m-0">Completed</h3>
                            <p-tag [value]="getProjectsByStatus('completed').length.toString()" severity="success"></p-tag>
                        </div>
                        <div class="flex flex-col gap-3 min-h-32">
                            <div *ngFor="let project of getProjectsByStatus('completed')" pDraggable="projects" (onDragStart)="dragStart(project)" (onDragEnd)="dragEnd()" class="bg-surface-0 dark:bg-surface-900 border border-surface rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectProject(project)">
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex items-baseline gap-2 flex-1">
                                        <h4 class="text-base font-semibold text-surface-900 dark:text-surface-0 m-0">
                                            {{ project.name }}
                                        </h4>
                                        <i class="pi pi-check-circle text-green-500 text-xl"></i>
                                    </div>
                                    <div class="flex justify-content-center align-content-end">
                                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditDialog(project); $event.stopPropagation()" />
                                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteProject(project)" />
                                    </div>
                                </div>

                                <p class="text-surface-700 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                    {{ project.description }}
                                </p>

                                <div class="flex items-center gap-2 text-xs text-muted-color mb-3">
                                    <i class="pi pi-calendar"></i>
                                    <span>Completed {{ project.endDate }}</span>
                                </div>

                                <div class="mb-3">
                                    <p-button 
                                        *ngIf="!isUserMember(project)"
                                        label="Join"
                                        icon="pi pi-user-plus"
                                        size="small"
                                        [outlined]="true"
                                        (onClick)="joinProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                    <p-button 
                                        *ngIf="isUserMember(project)"
                                        label="Leave"
                                        icon="pi pi-user-minus"
                                        size="small"
                                        [outlined]="true"
                                        severity="danger"
                                        (onClick)="leaveProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                </div>

                                <p-divider></p-divider>

                                <div class="mt-3">
                                    <p class="text-xs text-muted-color mb-2">Team</p>
                                    <p-avatargroup>
                                        <p-avatar 
                                            *ngFor="let member of project.participants.slice(0, 3)" 
                                            [image]="member.avatar" 
                                            shape="circle"
                                            size="normal"
                                        ></p-avatar>
                                        <p-avatar 
                                            *ngIf="project.participants.length > 3"
                                            [label]="'+' + (project.participants.length - 3)" 
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

            <!-- Project Details Modal/Section -->
            <div *ngIf="selectedProject" class="mt-8 border-t border-surface pt-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">{{ selectedProject.name }}</h2>
                    <div class="flex gap-2">
                        <p-button label="Edit" icon="pi pi-pencil" severity="secondary" [outlined]="true" (onClick)="openEditDialog(selectedProject)" />
                        <p-button label="Delete" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="confirmDeleteProject(selectedProject)" />
                        <p-button icon="pi pi-times" [text]="true" [rounded]="true" (onClick)="selectedProject = null"></p-button>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 lg:col-span-8">
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold m-0">Objectives</h3>
                                <p-button label="Add Objective" icon="pi pi-plus" size="small" (onClick)="openAddObjectiveDialog()" />
                            </div>
                            <div class="flex flex-col gap-4">
                                <div *ngFor="let objective of selectedProject.objectives" class="border border-surface rounded-lg p-4">
                                    <div class="flex justify-between items-start mb-3">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-2">{{ objective.title }}</h4>
                                            <p class="text-sm text-surface-700 dark:text-surface-300 mb-3">{{ objective.description }}</p>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <p-tag 
                                                [value]="objective.status" 
                                                [severity]="getObjectiveStatusSeverity(objective.status)"
                                            ></p-tag>
                                            <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditObjectiveDialog(objective)" />
                                            <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteObjective(objective)" />
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            @if (objective.members && objective.members.length > 0) {
                                                <p-avatarGroup>
                                                    @for (member of objective.members; track member.name) {
                                                        <p-avatar [image]="member.avatar" shape="circle" size="normal" [pTooltip]="member.name + ' (' + member.role + ')'"></p-avatar>
                                                    }
                                                </p-avatarGroup>
                                            } @else {
                                                <span class="text-sm text-surface-600 dark:text-surface-400">No members assigned</span>
                                            }
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm font-semibold">{{ objective.progress }}%</span>
                                            <div style="width: 100px;">
                                                <p-progressbar [value]="objective.progress" [showValue]="false"></p-progressbar>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center gap-2">
                                        @if (!isUserInObjective(objective)) {
                                            <p-button label="Join" icon="pi pi-user-plus" size="small" [outlined]="true" (onClick)="joinObjective(objective, $event)" />
                                        } @else {
                                            <p-button label="Leave" icon="pi pi-user-minus" size="small" [outlined]="true" severity="warn" (onClick)="leaveObjective(objective, $event)" />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-12 lg:col-span-4">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-4">Team Members</h3>
                            <div class="flex flex-col gap-3">
                                <div *ngFor="let member of selectedProject.participants" class="flex items-center gap-3">
                                    <p-avatar [image]="member.avatar" shape="circle" size="large"></p-avatar>
                                    <div>
                                        <p class="font-semibold m-0">{{ member.name }}</p>
                                        <p class="text-sm text-muted-color m-0">{{ member.role }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold m-0">Resources</h3>
                                <p-button icon="pi pi-plus" size="small" [text]="true" [rounded]="true" (onClick)="openAddResourceDialog()" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <div *ngFor="let resource of selectedProject.resources" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex-1">
                                            <a [href]="resource.url" target="_blank" class="font-semibold text-primary hover:underline flex items-center gap-2">
                                                {{ resource.title }}
                                                <i class="pi pi-external-link text-xs"></i>
                                            </a>
                                            <p class="text-xs text-muted-color m-0 mt-1">{{ resource.description }}</p>
                                        </div>
                                        <div class="flex gap-1">
                                            <p-button icon="pi pi-pencil" size="small" [text]="true" severity="secondary" (onClick)="openEditResourceDialog(resource)" />
                                            <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="confirmDeleteResource(resource)" />
                                        </div>
                                    </div>
                                    <p-tag [value]="resource.type" severity="secondary" styleClass="text-xs"></p-tag>
                                </div>
                                <div *ngIf="!selectedProject.resources || selectedProject.resources.length === 0" class="text-center text-muted-color text-sm py-4">
                                    No resources added yet
                                </div>
                            </div>
                        </div>

                        <!-- GitHub Commits Section -->
                        <div *ngIf="selectedProject.githubRepo">
                            <div class="flex justify-between items-center mb-4">
                                <div class="flex flex-col">
                                    <h3 class="text-lg font-semibold m-0 flex items-baseline gap-2">
                                        <i style="font-size: 1.5rem" class="pi pi-github text-xl"></i>
                                        GitHub Commits
                                    </h3>
                                    <span *ngIf="getTotalCommitsCount(selectedProject.id) > 0" class="text-xs text-muted-color">
                                        Showing {{ getTotalCommitsCount(selectedProject.id) }} commits
                                    </span>
                                </div>
                                <div class="flex gap-2">
                                    <p-button 
                                        icon="pi pi-refresh" 
                                        size="small" 
                                        [text]="true" 
                                        [rounded]="true" 
                                        (onClick)="loadGithubCommits(selectedProject)"
                                        [loading]="isLoadingGithubCommits(selectedProject.id)"
                                    />
                                    <a [href]="getGithubRepoUrl(selectedProject.githubRepo)" target="_blank">
                                        <p-button 
                                            icon="pi pi-external-link" 
                                            size="small" 
                                            [text]="true" 
                                            [rounded]="true"
                                            severity="secondary"
                                        />
                                    </a>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                <div *ngIf="isLoadingGithubCommits(selectedProject.id)" class="text-center text-muted-color text-sm py-4">
                                    <i class="pi pi-spin pi-spinner"></i> Loading commits...
                                </div>

                                <div *ngIf="getGithubError(selectedProject.id)" class="text-center text-red-500 text-sm py-4">
                                    <i class="pi pi-exclamation-triangle"></i>
                                    {{ getGithubError(selectedProject.id) }}
                                </div>

                                <div *ngIf="!isLoadingGithubCommits(selectedProject.id) && !getGithubError(selectedProject.id)">
                                    <div *ngFor="let commit of getGithubCommits(selectedProject.id)" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                                        <div class="flex items-start gap-3">
                                            <p-avatar 
                                                *ngIf="commit.author?.avatar_url; else defaultAvatar"
                                                [image]="commit.author!.avatar_url" 
                                                shape="circle" 
                                                size="normal"
                                            />
                                            <ng-template #defaultAvatar>
                                                <p-avatar 
                                                    icon="pi pi-user" 
                                                    shape="circle" 
                                                    size="normal"
                                                    styleClass="bg-surface-300"
                                                />
                                            </ng-template>
                                            
                                            <div class="flex-1 min-w-0">
                                                <a [href]="commit.html_url" target="_blank" class="text-sm font-medium text-surface-900 dark:text-surface-0 hover:text-primary hover:underline line-clamp-2">
                                                    {{ truncateCommitMessage(commit.commit.message) }}
                                                </a>
                                                <div class="flex items-center gap-2 mt-1 text-xs text-muted-color">
                                                    <span>{{ commit.author?.login || commit.commit.author.name }}</span>
                                                    <span>•</span>
                                                    <span>{{ formatCommitDate(commit.commit.author.date) }}</span>
                                                </div>
                                                <div class="text-xs text-muted-color font-mono mt-1">
                                                    {{ commit.sha.substring(0, 7) }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Load More Button -->
                                    <div *ngIf="getGithubCommits(selectedProject.id).length > 0 && hasMoreCommits(selectedProject.id)" class="text-center py-3">
                                        <p-button 
                                            label="Load More Commits" 
                                            icon="pi pi-chevron-down" 
                                            size="small"
                                            [outlined]="true"
                                            [loading]="isLoadingMoreCommits(selectedProject.id)"
                                            (onClick)="loadMoreCommits(selectedProject)"
                                        />
                                    </div>

                                    <!-- Loading More Indicator -->
                                    <div *ngIf="isLoadingMoreCommits(selectedProject.id)" class="text-center text-muted-color text-sm py-3">
                                        <i class="pi pi-spin pi-spinner"></i> Loading more commits...
                                    </div>

                                    <!-- No commits found -->
                                    <div *ngIf="getGithubCommits(selectedProject.id).length === 0 && !isLoadingGithubCommits(selectedProject.id) && !getGithubError(selectedProject.id)" class="text-center text-muted-color text-sm py-4">
                                        <p-button 
                                            label="Load Commits" 
                                            icon="pi pi-github" 
                                            size="small"
                                            [outlined]="true"
                                            (onClick)="loadGithubCommits(selectedProject)"
                                        />
                                    </div>

                                    <!-- End of commits indicator -->
                                    <div *ngIf="getGithubCommits(selectedProject.id).length > 0 && !hasMoreCommits(selectedProject.id)" class="text-center text-muted-color text-xs py-2">
                                        <i class="pi pi-check-circle"></i> All commits loaded
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Projects {
    constructor(private confirmationService: ConfirmationService, private http: HttpClient) {}
    
    // Current logged-in user
    currentUser: Member = {
        name: 'Ioni Bowcher',
        avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',
        role: 'Developer'
    };
    
    selectedProject: Project | null = null;
    draggedProject: Project | null = null;
    dialogVisible = false;
    dialogMode: 'add' | 'edit' = 'add';
    currentProject: Project = this.getEmptyProject();
    startDate: Date | null = null;
    endDate: Date | null = null;
    
    objectiveDialogVisible = false;
    objectiveDialogMode: 'add' | 'edit' = 'add';
    currentObjective: Objective = this.getEmptyObjective();
    selectedMemberNames: string[] = [];
    selectedObjectiveMemberNames: string[] = [];
    
    resourceDialogVisible = false;
    resourceDialogMode: 'add' | 'edit' = 'add';
    currentResource: Resource = this.getEmptyResource();
    
    availableMembers: Member[] = [
        { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Project Lead' },
        { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Hardware Engineer' },
        { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Software Developer' },
        { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'UI/UX Designer' },
        { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Lead Engineer' },
        { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png', role: 'Technician' }
    ];
    
    statusOptions = [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' }
    ];
    
    objectiveStatusOptions = [
        { label: 'To Do', value: 'todo' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' }
    ];
    
    resourceTypeOptions = [
        { label: 'Documentation', value: 'documentation' },
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'Tool', value: 'tool' },
        { label: 'Reference', value: 'reference' },
        { label: 'Other', value: 'other' }
    ];

    projects: Project[] = [
        {
            id: 1,
            name: 'Smart Home Automation System',
            description: 'Develop an IoT-based home automation system using Arduino and Raspberry Pi to control lights, temperature, and security.',
            status: 'in-progress',
            startDate: 'Nov 1, 2025',
            endDate: 'Feb 28, 2026',
            progress: 65,
            participants: [
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Project Lead' },
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Hardware Engineer' },
                { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Software Developer' },
                { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'UI/UX Designer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Circuit Design & Hardware Setup',
                    description: 'Design and assemble the circuit board with sensors and actuators',
                    status: 'completed',
                    assignedTo: { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Hardware Engineer' },
                    progress: 100
                },
                {
                    id: 2,
                    title: 'Backend API Development',
                    description: 'Create RESTful API for device control and monitoring',
                    status: 'in-progress',
                    assignedTo: { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Software Developer' },
                    progress: 70
                },
                {
                    id: 3,
                    title: 'Mobile App UI Design',
                    description: 'Design user-friendly mobile interface for system control',
                    status: 'in-progress',
                    assignedTo: { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'UI/UX Designer' },
                    progress: 50
                },
                {
                    id: 4,
                    title: 'System Integration & Testing',
                    description: 'Integrate all components and perform end-to-end testing',
                    status: 'todo',
                    assignedTo: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Project Lead' },
                    progress: 0
                }
            ],
            resources: [
                {
                    id: 1,
                    title: 'Arduino Home Automation Guide',
                    url: 'https://www.arduino.cc/en/Tutorial/HomePage',
                    description: 'Official Arduino tutorials for IoT projects',
                    type: 'tutorial'
                },
                {
                    id: 2,
                    title: 'MQTT Protocol Documentation',
                    url: 'https://mqtt.org/documentation',
                    description: 'Communication protocol for IoT devices',
                    type: 'documentation'
                },
                {
                    id: 3,
                    title: 'Home Assistant Integration',
                    url: 'https://www.home-assistant.io/',
                    description: 'Open source home automation platform',
                    type: 'tool'
                }
            ]
        },
        {
            id: 2,
            name: '3D Printer Upgrade Project',
            description: 'Upgrade existing 3D printers with auto-leveling sensors and improved cooling systems.',
            status: 'in-progress',
            startDate: 'Dec 1, 2025',
            endDate: 'Jan 15, 2026',
            progress: 40,
            participants: [
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Lead Engineer' },
                { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png', role: 'Technician' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Install Auto-Leveling Sensors',
                    description: 'Add BLTouch sensors to all printers',
                    status: 'in-progress',
                    assignedTo: { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Lead Engineer' },
                    progress: 60
                },
                {
                    id: 2,
                    title: 'Upgrade Cooling Systems',
                    description: 'Replace fans with high-performance cooling solution',
                    status: 'todo',
                    assignedTo: { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png', role: 'Technician' },
                    progress: 20
                }
            ]
        },
        {
            id: 3,
            name: 'Community Website Redesign',
            description: 'Redesign the FLOSSK community website with modern UI and improved user experience.',
            status: 'upcoming',
            startDate: 'Jan 15, 2026',
            endDate: 'Mar 30, 2026',
            progress: 0,
            participants: [
                { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'Lead Designer' },
                { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Frontend Developer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Requirements Gathering',
                    description: 'Collect feedback and requirements from community members',
                    status: 'todo',
                    assignedTo: { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'Lead Designer' },
                    progress: 0
                },
                {
                    id: 2,
                    title: 'UI/UX Design',
                    description: 'Create wireframes and high-fidelity mockups',
                    status: 'completed',
                    assignedTo: { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'Lead Designer' },
                    progress: 0
                }
            ]
        },
        {
            id: 4,
            name: 'Robotics Competition Team',
            description: 'Build and program a robot for the regional robotics competition in March 2026.',
            status: 'completed',
            startDate: 'Sep 1, 2025',
            endDate: 'Nov 30, 2025',
            progress: 100,
            participants: [
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Team Captain' },
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Robot Design & Build',
                    description: 'Design and construct the robot chassis and mechanisms',
                    status: 'completed',
                    assignedTo: { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' },
                    progress: 100
                },
                {
                    id: 2,
                    title: 'Programming & Testing',
                    description: 'Write control software and test robot performance',
                    status: 'completed',
                    assignedTo: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                    progress: 100
                }
            ]
        },
        {
            id: 4,
            name: 'Create FLOSSK Management System',
            description: 'Handles all NGO events including workshops, bootcamps, hackathons, speaking events, and meetups.',
            status: 'upcoming',
            startDate: 'Sep 1, 2025',
            endDate: 'Nov 30, 2025',
            progress: 100,
            githubRepo: 'Daxrsa/sakai-ng',
            participants: [
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Team Captain' },
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Create Frontend',
                    description: 'Create a responsive dashboard',
                    status: 'in-progress',
                    assignedTo: { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' },
                    progress: 40
                },
                {
                    id: 2,
                    title: 'Create Backend',
                    description: 'Create a REST API for handling requests',
                    status: 'todo',
                    assignedTo: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                    progress: 0
                }
            ],
            resources: [
                {
                    id: 1,
                    title: 'FLOSSK Management System Requirements',
                    url: 'https://docs.google.com/document/d/1TQnmEBGvfp3RGmQpFvrh2fJIs3a49xb18ECVs_x0XXY/edit?tab=t.0',
                    description: 'Project requirements and specifications document',
                    type: 'documentation'
                }
            ]
        }
    ];

    getProjectsByStatus(status: string): Project[] {
        return this.projects.filter(p => p.status === status);
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'secondary' {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'info';
            case 'upcoming': return 'warn';
            default: return 'secondary';
        }
    }

    getObjectiveStatusSeverity(status: string): 'success' | 'info' | 'secondary' {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'info';
            case 'todo': return 'secondary';
            default: return 'secondary';
        }
    }

    dragStart(project: Project) {
        this.draggedProject = project;
    }

    dragEnd() {
        this.draggedProject = null;
    }

    onDrop(event: any, newStatus: 'upcoming' | 'in-progress' | 'completed') {
        if (this.draggedProject) {
            // Update the project status
            const project = this.projects.find(p => p.id === this.draggedProject!.id);
            if (project && project.status !== newStatus) {
                project.status = newStatus;

                // Update progress based on status
                if (newStatus === 'upcoming') {
                    project.progress = 0;
                } else if (newStatus === 'completed') {
                    project.progress = 100;
                }
                // For 'in-progress', keep the current progress
            }
            this.draggedProject = null;
        }
    }
    
    getEmptyProject(): Project {
        return {
            id: 0,
            name: '',
            description: '',
            status: 'upcoming',
            startDate: '',
            endDate: '',
            progress: 0,
            participants: [],
            objectives: []
        };
    }
    
    formatDate(date: Date): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    
    openAddDialog() {
        this.dialogMode = 'add';
        this.currentProject = this.getEmptyProject();
        this.startDate = null;
        this.endDate = null;
        this.selectedMemberNames = [];
        this.dialogVisible = true;
    }
    
    openEditDialog(project: Project) {
        this.dialogMode = 'edit';
        this.currentProject = { ...project, participants: [...project.participants], objectives: [...project.objectives] };
        // Parse dates if they exist
        this.startDate = project.startDate ? new Date(project.startDate) : null;
        this.endDate = project.endDate ? new Date(project.endDate) : null;
        // Load current team member names
        this.selectedMemberNames = project.participants.map(p => p.name);
        this.dialogVisible = true;
    }
    
    saveProject() {
        // Format dates
        if (this.startDate) {
            this.currentProject.startDate = this.formatDate(this.startDate);
        }
        if (this.endDate) {
            this.currentProject.endDate = this.formatDate(this.endDate);
        }
        
        // Convert selected member names to participants
        this.currentProject.participants = this.availableMembers.filter(m => 
            this.selectedMemberNames.includes(m.name)
        );
        
        if (this.dialogMode === 'add') {
            // Generate new ID
            const maxId = this.projects.length > 0 
                ? Math.max(...this.projects.map(p => p.id)) 
                : 0;
            this.currentProject.id = maxId + 1;
            this.currentProject.status = 'upcoming';
            this.currentProject.progress = 0;
            this.currentProject.objectives = [];
            this.projects.push(this.currentProject);
        } else {
            // Update existing project
            const index = this.projects.findIndex(p => p.id === this.currentProject.id);
            if (index !== -1) {
                // Update progress based on status if status changed
                if (this.currentProject.status === 'upcoming') {
                    this.currentProject.progress = 0;
                } else if (this.currentProject.status === 'completed') {
                    this.currentProject.progress = 100;
                }
                this.projects[index] = this.currentProject;
            }
        }
        this.dialogVisible = false;
    }
    
    confirmDeleteProject(project: Project) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteProject(project);
            }
        });
    }
    
    deleteProject(project: Project) {
        this.projects = this.projects.filter(p => p.id !== project.id);
        // Close details if the deleted project was selected
        if (this.selectedProject?.id === project.id) {
            this.selectedProject = null;
        }
    }
    
    getEmptyObjective(): Objective {
        return {
            id: 0,
            title: '',
            description: '',
            status: 'todo',
            assignedTo: { name: 'Unassigned', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Member' },
            progress: 0,
            members: []
        };
    }
    
    openAddObjectiveDialog() {
        if (!this.selectedProject) return;
        this.objectiveDialogMode = 'add';
        this.currentObjective = this.getEmptyObjective();
        this.selectedObjectiveMemberNames = [];
        this.objectiveDialogVisible = true;
    }
    
    openEditObjectiveDialog(objective: Objective) {
        this.objectiveDialogMode = 'edit';
        this.currentObjective = { ...objective, assignedTo: { ...objective.assignedTo }, members: objective.members ? [...objective.members] : [] };
        this.selectedObjectiveMemberNames = objective.members ? objective.members.map(m => m.name) : [];
        this.objectiveDialogVisible = true;
    }
    
    saveObjective() {
        if (!this.selectedProject) return;
        
        // Convert selected member names to Member objects
        this.currentObjective.members = this.availableMembers.filter(m => 
            this.selectedObjectiveMemberNames.includes(m.name)
        );
        
        if (this.objectiveDialogMode === 'add') {
            const maxId = this.selectedProject.objectives.length > 0
                ? Math.max(...this.selectedProject.objectives.map(o => o.id))
                : 0;
            this.currentObjective.id = maxId + 1;
            this.selectedProject.objectives.push(this.currentObjective);
        } else {
            const index = this.selectedProject.objectives.findIndex(o => o.id === this.currentObjective.id);
            if (index !== -1) {
                this.selectedProject.objectives[index] = this.currentObjective;
            }
        }
        
        // Update the project in the main projects array
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
        
        this.objectiveDialogVisible = false;
    }
    
    confirmDeleteObjective(objective: Objective) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${objective.title}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteObjective(objective);
            }
        });
    }
    
    deleteObjective(objective: Objective) {
        if (!this.selectedProject) return;
        this.selectedProject.objectives = this.selectedProject.objectives.filter(o => o.id !== objective.id);
        
        // Update the project in the main projects array
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
    }
    
    isUserMember(project: Project): boolean {
        return project.participants.some(p => p.name === this.currentUser.name);
    }
    
    joinProject(project: Project, event: Event) {
        event.stopPropagation();
        if (!this.isUserMember(project)) {
            project.participants.push({ ...this.currentUser });
        }
    }
    
    leaveProject(project: Project, event: Event) {
        event.stopPropagation();
        project.participants = project.participants.filter(p => p.name !== this.currentUser.name);
    }
    
    getEmptyResource(): Resource {
        return {
            id: 0,
            title: '',
            url: '',
            description: '',
            type: 'documentation'
        };
    }
    
    openAddResourceDialog() {
        if (!this.selectedProject) return;
        this.resourceDialogMode = 'add';
        this.currentResource = this.getEmptyResource();
        this.resourceDialogVisible = true;
    }
    
    openEditResourceDialog(resource: Resource) {
        this.resourceDialogMode = 'edit';
        this.currentResource = { ...resource };
        this.resourceDialogVisible = true;
    }
    
    saveResource() {
        if (!this.selectedProject) return;
        
        if (!this.selectedProject.resources) {
            this.selectedProject.resources = [];
        }
        
        if (this.resourceDialogMode === 'add') {
            const maxId = this.selectedProject.resources.length > 0
                ? Math.max(...this.selectedProject.resources.map(r => r.id))
                : 0;
            this.currentResource.id = maxId + 1;
            this.selectedProject.resources.push(this.currentResource);
        } else {
            const index = this.selectedProject.resources.findIndex(r => r.id === this.currentResource.id);
            if (index !== -1) {
                this.selectedProject.resources[index] = this.currentResource;
            }
        }
        
        // Update the project in the main projects array
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
        
        this.resourceDialogVisible = false;
    }
    
    confirmDeleteResource(resource: Resource) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${resource.title}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteResource(resource);
            }
        });
    }
    
    deleteResource(resource: Resource) {
        if (!this.selectedProject || !this.selectedProject.resources) return;
        this.selectedProject.resources = this.selectedProject.resources.filter(r => r.id !== resource.id);
        
        // Update the project in the main projects array
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
    }
    
    isUserInObjective(objective: Objective): boolean {
        return objective.members ? objective.members.some(m => m.name === this.currentUser.name) : false;
    }
    
    joinObjective(objective: Objective, event: Event) {
        event.stopPropagation();
        if (!objective.members) {
            objective.members = [];
        }
        if (!this.isUserInObjective(objective)) {
            objective.members.push({ ...this.currentUser });
        }
    }
    
    leaveObjective(objective: Objective, event: Event) {
        event.stopPropagation();
        if (objective.members) {
            objective.members = objective.members.filter(m => m.name !== this.currentUser.name);
        }
    }

    // GitHub Integration Properties
    githubCommits: Map<number, GitHubCommit[]> = new Map();
    loadingGithubCommits: Set<number> = new Set();
    githubError: Map<number, string> = new Map();
    githubPagination: Map<number, { currentPage: number; hasMore: boolean; totalCommits: number }> = new Map();
    loadingMoreCommits: Set<number> = new Set();

    // GitHub Integration Methods
    loadGithubCommits(project: Project, loadMore: boolean = false) {
        if (!project.githubRepo || this.loadingGithubCommits.has(project.id)) {
            return;
        }

        if (loadMore) {
            this.loadingMoreCommits.add(project.id);
        } else {
            this.loadingGithubCommits.add(project.id);
            this.githubError.delete(project.id);
            // Reset pagination for fresh load
            this.githubPagination.set(project.id, { currentPage: 1, hasMore: true, totalCommits: 0 });
        }

        // Extract owner and repo from the githubRepo format (owner/repo)
        const [owner, repo] = project.githubRepo.split('/');
        
        if (!owner || !repo) {
            this.githubError.set(project.id, 'Invalid GitHub repository format');
            this.loadingGithubCommits.delete(project.id);
            this.loadingMoreCommits.delete(project.id);
            return;
        }

        const paginationInfo = this.githubPagination.get(project.id) || { currentPage: 1, hasMore: true, totalCommits: 0 };
        const page = loadMore ? paginationInfo.currentPage : 1;
        const perPage = 10; // Load more commits per page
        
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;

        this.http.get<GitHubCommit[]>(apiUrl, { observe: 'response' })
            .pipe(
                catchError(error => {
                    console.error('GitHub API Error:', error);
                    if (error.status === 403) {
                        this.githubError.set(project.id, 'GitHub API rate limit exceeded. Please try again later.');
                    } else if (error.status === 404) {
                        this.githubError.set(project.id, 'Repository not found or not accessible');
                    } else {
                        this.githubError.set(project.id, 'Failed to load GitHub commits');
                    }
                    return of(null);
                })
            )
            .subscribe({
                next: (response) => {
                    if (response && response.body) {
                        const commits = response.body;
                        
                        if (loadMore) {
                            // Append new commits to existing ones
                            const existingCommits = this.githubCommits.get(project.id) || [];
                            this.githubCommits.set(project.id, [...existingCommits, ...commits]);
                        } else {
                            // Set new commits
                            this.githubCommits.set(project.id, commits);
                        }

                        // Update pagination info
                        const linkHeader = response.headers.get('Link');
                        const hasNextPage = linkHeader ? linkHeader.includes('rel="next"') : commits.length === perPage;
                        
                        this.githubPagination.set(project.id, {
                            currentPage: page + 1,
                            hasMore: hasNextPage,
                            totalCommits: (this.githubCommits.get(project.id) || []).length
                        });
                    }
                    
                    this.loadingGithubCommits.delete(project.id);
                    this.loadingMoreCommits.delete(project.id);
                },
                error: (error) => {
                    console.error('Error loading GitHub commits:', error);
                    this.githubError.set(project.id, 'Failed to load GitHub commits');
                    this.loadingGithubCommits.delete(project.id);
                    this.loadingMoreCommits.delete(project.id);
                }
            });
    }

    getGithubCommits(projectId: number): GitHubCommit[] {
        return this.githubCommits.get(projectId) || [];
    }

    isLoadingGithubCommits(projectId: number): boolean {
        return this.loadingGithubCommits.has(projectId);
    }

    getGithubError(projectId: number): string | null {
        return this.githubError.get(projectId) || null;
    }

    hasMoreCommits(projectId: number): boolean {
        const paginationInfo = this.githubPagination.get(projectId);
        return paginationInfo ? paginationInfo.hasMore : false;
    }

    isLoadingMoreCommits(projectId: number): boolean {
        return this.loadingMoreCommits.has(projectId);
    }

    getTotalCommitsCount(projectId: number): number {
        const paginationInfo = this.githubPagination.get(projectId);
        return paginationInfo ? paginationInfo.totalCommits : 0;
    }

    loadMoreCommits(project: Project) {
        if (!this.hasMoreCommits(project.id) || this.isLoadingMoreCommits(project.id)) {
            return;
        }
        this.loadGithubCommits(project, true);
    }

    formatCommitDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    getGithubRepoUrl(githubRepo: string): string {
        return `https://github.com/${githubRepo}`;
    }

    truncateCommitMessage(message: string, maxLength: number = 60): string {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    }

    selectProject(project: Project) {
        this.selectedProject = project;
        if (project.githubRepo) {
            this.loadGithubCommits(project);
        }
    }
}
