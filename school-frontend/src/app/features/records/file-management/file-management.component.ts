import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilesService } from '../../../core/services/files.service';
import { SchoolFile } from '../../../core/models/school-file.model';

@Component({
    selector: 'app-file-management',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './file-management.component.html',
    styleUrls: ['./file-management.component.scss']
})
export class FileManagementComponent implements OnInit {
    files: SchoolFile[] = [];
    displayedColumns: string[] = ['name', 'type', 'size', 'date', 'actions'];

    constructor(private filesService: FilesService) { }

    ngOnInit() {
        this.loadFiles();
    }

    loadFiles() {
        this.filesService.getAll().subscribe(data => this.files = data);
    }

    downloadFile(file: SchoolFile) {
        window.open(file.url, '_blank');
    }
}
