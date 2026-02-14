import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // For upload progress
import { RecordsService } from '../../../core/services/records.service';
import { SchoolFile } from '../../../core/models/school-file.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-student-records',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatProgressBarModule
    ],
    templateUrl: './student-records.component.html',
    styleUrls: ['./student-records.component.scss']
})
export class StudentRecordsComponent implements OnInit {
    @Input() studentId?: number;
    files: SchoolFile[] = [];
    isUploading = false;

    constructor(
        private recordsService: RecordsService,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        // If not passed as input, try to get from route
        if (!this.studentId) {
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.studentId = +id;
            }
        }

        if (this.studentId) {
            this.loadFiles();
        }
    }

    loadFiles() {
        if (this.studentId) {
            this.recordsService.getByStudent(this.studentId).subscribe(data => this.files = data);
        }
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file && this.studentId) {
            this.isUploading = true;
            const metadata = { studentId: this.studentId };

            this.recordsService.upload(file, metadata).subscribe({
                next: (newFile) => {
                    this.notificationService.success('File uploaded successfully');
                    this.files.push(newFile);
                    this.isUploading = false;
                },
                error: () => {
                    this.isUploading = false;
                }
            });
        }
    }

    deleteFile(file: SchoolFile) {
        if (confirm(`Are you sure you want to delete ${file.name}?`)) {
            this.recordsService.delete(file.id).subscribe({
                next: () => {
                    this.notificationService.success('File deleted successfully');
                    this.files = this.files.filter(f => f.id !== file.id);
                },
                error: () => { }
            });
        }
    }

    downloadFile(file: SchoolFile) {
        // Logic to download file, e.g., opening URL in new tab
        window.open(file.url, '_blank');
    }
}
