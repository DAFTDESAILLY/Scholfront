    saveGrades() {
        if (this.gradingData.length === 0) {
            this.notificationService.warning('No hay calificaciones para guardar');
            return;
        }

        const evaluationId = this.filterForm.get('evaluationId')?.value;

        // Mapear al formato correcto que espera el backend
        const grades = this.gradingData.map(item => ({
            evaluationItemId: evaluationId,              // ✅ Corregido
            studentAssignmentId: item.studentAssignmentId, // ✅ Corregido
            score: item.score,
            feedback: item.feedback || ''
        }));

        console.log('📤 Guardando calificaciones:', grades);

        this.evaluationsService.saveGrades(grades).subscribe({
            next: (result) => {
                console.log('✅ Respuesta del servidor:', result);
                this.notificationService.success('Calificaciones guardadas exitosamente');
            },
            error: (err) => {
                console.error('❌ Error guardando calificaciones:', err);
                console.error('❌ Detalles del error:', err.error);

                let errorMsg = 'Error al guardar calificaciones';
                if (err.error?.message) {
                    errorMsg = `Error: ${err.error.message}`;
                } else if (err.status === 0) {
                    errorMsg = 'No se pudo conectar con el servidor';
                }

                this.notificationService.error(errorMsg);
            }
        });
    }