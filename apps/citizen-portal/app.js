document.addEventListener('DOMContentLoaded', () => {
    const disputeForm = document.getElementById('disputeForm');
    const fileInput = document.getElementById('fileInput');
    const dropzone = document.getElementById('dropzone');
    const fileBadge = document.getElementById('fileBadge');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const submitBtn = document.getElementById('submitBtn');

    const dashboardPlaceholder = document.getElementById('dashboardPlaceholder');
    const dashboardContent = document.getElementById('dashboardContent');
    const workflowPulse = document.getElementById('workflowPulse');
    const execIdBanner = document.getElementById('execIdBanner');
    const workflowStatusBadge = document.getElementById('workflowStatusBadge');

    const logsFeed = document.getElementById('logsFeed');
    const resultCard = document.getElementById('resultCard');
    const auditTrailText = document.getElementById('auditTrailText');

    // Architecture Modal Setup
    const archModal = document.getElementById('archModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    openModalBtn.addEventListener('click', () => {
        archModal.classList.add('show');
    });

    closeModalBtn.addEventListener('click', () => {
        archModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === archModal) {
            archModal.classList.remove('show');
        }
    });

    let selectedFileBase64 = 'JVBERi0xLjQKJcFSnaHlhb3Mta2VybmVsLW12cC1kZWVkLWJhc2U2NC10ZXN0Cg=='; // Default mock PDF header
    let selectedFileName = 'LandSaleDeed_RajeshKumar.pdf';

    function setDefaultFile() {
        selectedFileName = 'LandSaleDeed_RajeshKumar.pdf';
        selectedFileBase64 = 'JVBERi0xLjQKJcFSnaHlhb3Mta2VybmVsLW12cC1kZWVkLWJhc2U2NC10ZXN0Cg==';
        if (fileNameDisplay) fileNameDisplay.textContent = 'LandSaleDeed_RajeshKumar.pdf';
        if (dropzone) dropzone.style.display = 'none';
        if (fileBadge) fileBadge.style.display = 'flex';
        updateReadiness();
    }

    function clearFile() {
        if (fileInput) fileInput.value = '';
        selectedFileName = '';
        selectedFileBase64 = '';
        if (fileBadge) fileBadge.style.display = 'none';
        if (dropzone) dropzone.style.display = 'block';
        updateReadiness();
    }

    // Scenario Cards Event listeners & Autofills
    const scenarioCards = document.querySelectorAll('.scenario-card');
    scenarioCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Remove active classes
            scenarioCards.forEach(c => c.classList.remove('active'));
            // Set current active
            card.classList.add('active');
            // Select inner radio button
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                applyScenarioFields(radio.value);
            }
        });
    });

    function applyScenarioFields(profile) {
        const plaintiffNameInput = document.getElementById('plaintiffName');
        const citizenIdInput = document.getElementById('citizenId');
        const defendantNameInput = document.getElementById('defendantName');
        const defendantIdInput = document.getElementById('defendantId');
        const propertyIdInput = document.getElementById('propertyId');
        const surveyNumberInput = document.getElementById('surveyNumber');
        const registrationNumberInput = document.getElementById('registrationNumber');
        const propertyAreaInput = document.getElementById('propertyArea');
        const propertyVillageInput = document.getElementById('propertyVillage');
        const propertyDistrictInput = document.getElementById('propertyDistrict');
        const propertyStateInput = document.getElementById('propertyState');
        const courtNameInput = document.getElementById('courtName');
        const locationInput = document.getElementById('location');
        const descriptionInput = document.getElementById('description');

        if (profile === 'happy_path' || profile === 'missing_documents' || profile === 'duplicate_filing') {
            if (plaintiffNameInput) plaintiffNameInput.value = 'Rajesh Kumar';
            if (citizenIdInput) citizenIdInput.value = 'cit-9988';
            if (defendantNameInput) defendantNameInput.value = 'Mahesh Reddy';
            if (defendantIdInput) defendantIdInput.value = 'cit-7541';
            if (propertyIdInput) propertyIdInput.value = 'plot-7412A';
            if (surveyNumberInput) surveyNumberInput.value = 'SY-114/2';
            if (registrationNumberInput) registrationNumberInput.value = 'REG-2021-98441';
            if (propertyAreaInput) propertyAreaInput.value = '2400 sq.ft';
            if (propertyVillageInput) propertyVillageInput.value = 'Whitefield';
            if (propertyDistrictInput) propertyDistrictInput.value = 'Bengaluru Urban';
            if (propertyStateInput) propertyStateInput.value = 'Karnataka';
            if (courtNameInput) courtNameInput.value = 'Bengaluru District Court';
            if (locationInput) locationInput.value = 'Bengaluru, Karnataka';
            if (descriptionInput) descriptionInput.value = 'title dispute possession';

            if (profile === 'missing_documents') {
                clearFile();
            } else {
                setDefaultFile();
            }
        } else if (profile === 'wrong_jurisdiction') {
            if (plaintiffNameInput) plaintiffNameInput.value = 'Rajesh Kumar';
            if (citizenIdInput) citizenIdInput.value = 'cit-9988';
            if (defendantNameInput) defendantNameInput.value = 'Mahesh Reddy';
            if (defendantIdInput) defendantIdInput.value = 'cit-7541';
            if (propertyIdInput) propertyIdInput.value = 'plot-7412A';
            if (surveyNumberInput) surveyNumberInput.value = 'SY-114/2';
            if (registrationNumberInput) registrationNumberInput.value = 'REG-2021-98441';
            if (propertyAreaInput) propertyAreaInput.value = '2400 sq.ft';
            if (propertyVillageInput) propertyVillageInput.value = 'Whitefield';
            if (propertyDistrictInput) propertyDistrictInput.value = 'Bengaluru Urban';
            if (propertyStateInput) propertyStateInput.value = 'Karnataka';
            if (courtNameInput) courtNameInput.value = 'Delhi High Court';
            if (locationInput) locationInput.value = 'Delhi, NCT';
            if (descriptionInput) descriptionInput.value = 'wrong territorial filing check';
            setDefaultFile();
        } else if (profile === 'identity_failure') {
            if (plaintiffNameInput) plaintiffNameInput.value = 'Rajesh K.';
            if (citizenIdInput) citizenIdInput.value = 'cit-9988';
            if (defendantNameInput) defendantNameInput.value = 'Mahesh Reddy';
            if (defendantIdInput) defendantIdInput.value = 'cit-7541';
            if (propertyIdInput) propertyIdInput.value = 'plot-7412A';
            if (surveyNumberInput) surveyNumberInput.value = 'SY-114/2';
            if (registrationNumberInput) registrationNumberInput.value = 'REG-2021-98441';
            if (propertyAreaInput) propertyAreaInput.value = '2400 sq.ft';
            if (propertyVillageInput) propertyVillageInput.value = 'Whitefield';
            if (propertyDistrictInput) propertyDistrictInput.value = 'Bengaluru Urban';
            if (propertyStateInput) propertyStateInput.value = 'Karnataka';
            if (courtNameInput) courtNameInput.value = 'Bengaluru District Court';
            if (locationInput) locationInput.value = 'Bengaluru, Karnataka';
            if (descriptionInput) descriptionInput.value = 'identity biometric verification test';
            setDefaultFile();
        }
        updateReadiness();
    }

    function updateReadiness() {
        const plaintiffName = document.getElementById('plaintiffName')?.value || '';
        const citizenId = document.getElementById('citizenId')?.value || '';
        const defendantName = document.getElementById('defendantName')?.value || '';
        const defendantId = document.getElementById('defendantId')?.value || '';

        const propertyId = document.getElementById('propertyId')?.value || '';
        const surveyNumber = document.getElementById('surveyNumber')?.value || '';
        const registrationNumber = document.getElementById('registrationNumber')?.value || '';
        const propertyArea = document.getElementById('propertyArea')?.value || '';

        const courtName = document.getElementById('courtName')?.value || '';
        const location = document.getElementById('location')?.value || '';
        const description = document.getElementById('description')?.value || '';

        const hasDeed = selectedFileBase64 !== '';

        const hasParties = plaintiffName !== '' && citizenId !== '' && defendantName !== '' && defendantId !== '';
        const chkParties = document.getElementById('chk-parties');
        if (chkParties) {
            chkParties.textContent = hasParties ? '✓ Parties: Plaintiff & Defendant defined' : '✗ Parties: Plaintiff & Defendant details incomplete';
            chkParties.className = 'readiness-checkpoint ' + (hasParties ? 'ok' : 'missing');
        }

        const hasProperty = propertyId !== '' && surveyNumber !== '' && registrationNumber !== '' && propertyArea !== '';
        const chkProperty = document.getElementById('chk-property');
        if (chkProperty) {
            chkProperty.textContent = hasProperty ? '✓ Property: Plot, Survey & Coordinates complete' : '✗ Property: Missing identifier, survey or area';
            chkProperty.className = 'readiness-checkpoint ' + (hasProperty ? 'ok' : 'missing');
        }

        const hasCase = courtName !== '' && location !== '' && description !== '';
        const chkCase = document.getElementById('chk-case');
        if (chkCase) {
            chkCase.textContent = hasCase ? '✓ Case: Court jurisdiction correct' : '✗ Case: Missing court, location or description';
            chkCase.className = 'readiness-checkpoint ' + (hasCase ? 'ok' : 'missing');
        }

        const chkDeed = document.getElementById('chk-deed');
        if (chkDeed) {
            chkDeed.textContent = hasDeed ? '✓ Attachment: Land Sale Deed appended' : '✗ Attachment: Land Sale Deed missing';
            chkDeed.className = 'readiness-checkpoint ' + (hasDeed ? 'ok' : 'missing');
        }

        const readinessStatusBadge = document.getElementById('readinessStatusBadge');
        const isReady = hasParties && hasProperty && hasCase && hasDeed;
        if (readinessStatusBadge) {
            if (isReady) {
                readinessStatusBadge.textContent = 'READY TO FILE';
                readinessStatusBadge.className = 'readiness-status-badge status-ready';
            } else {
                readinessStatusBadge.textContent = 'INCOMPLETE';
                readinessStatusBadge.className = 'readiness-status-badge status-incomplete';
            }
        }

        // Live draft review preview update
        const valPlaintiff = document.getElementById('val-plaintiff');
        if (valPlaintiff) valPlaintiff.textContent = plaintiffName || '(empty)';
        const valDefendant = document.getElementById('val-defendant');
        if (valDefendant) valDefendant.textContent = defendantName || '(empty)';

        const valDeedYear = document.getElementById('val-deed-year');
        if (valDeedYear) {
            valDeedYear.textContent = hasDeed ? '2022' : 'None';
        }
    }

    // Listen to changes for readiness
    const inputsToWatch = ['plaintiffName', 'citizenId', 'defendantName', 'defendantId', 'propertyId', 'surveyNumber', 'registrationNumber', 'propertyArea', 'propertyVillage', 'propertyDistrict', 'propertyState', 'courtName', 'location', 'description'];
    inputsToWatch.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateReadiness);
            el.addEventListener('change', updateReadiness);
        }
    });

    // Drag and Drop listeners
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'hsl(250, 85%, 65%)';
        dropzone.style.backgroundColor = 'rgba(120, 90, 240, 0.08)';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '';
        dropzone.style.backgroundColor = '';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        dropzone.style.backgroundColor = '';
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        selectedFileName = file.name;
        if (fileNameDisplay) fileNameDisplay.textContent = file.name;
        if (dropzone) dropzone.style.display = 'none';
        if (fileBadge) fileBadge.style.display = 'flex';

        const reader = new FileReader();
        reader.onload = function (evt) {
            const rawB64 = evt.target.result.split(',')[1];
            selectedFileBase64 = rawB64;
            updateReadiness();
        };
        reader.readAsDataURL(file);
    }

    clearFileBtn.addEventListener('click', clearFile);

    // Initial readiness analysis
    updateReadiness();

    // Form Submit Handler
    disputeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Form visual state: loading
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';

        // Read selected radio scenario value
        const activeRadio = document.querySelector('input[name="demoProfile"]:checked');
        const demoProfileVal = activeRadio ? activeRadio.value : 'happy_path';

        // Prepare request body payload
        const payload = {
            caseType: document.getElementById('caseType').value,
            plaintiffName: document.getElementById('plaintiffName').value,
            citizenId: document.getElementById('citizenId').value,
            defendantName: document.getElementById('defendantName').value,
            defendantId: document.getElementById('defendantId').value,
            plotId: document.getElementById('propertyId').value,
            surveyNumber: document.getElementById('surveyNumber').value,
            registrationNumber: document.getElementById('registrationNumber').value,
            propertyArea: document.getElementById('propertyArea').value,
            propertyVillage: document.getElementById('propertyVillage').value,
            propertyDistrict: document.getElementById('propertyDistrict').value,
            propertyState: document.getElementById('propertyState').value,
            courtName: document.getElementById('courtName').value,
            location: document.getElementById('location').value,
            disputeDescription: document.getElementById('description').value,
            fileName: selectedFileName,
            contentBase64: selectedFileBase64,
            documentType: 'Deed',
            demoProfile: demoProfileVal
        };

        try {
            const response = await fetch('/workflow/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to start workflow');
            }

            const data = await response.json();
            const executionId = data.executionId;

            // Transition UI Panels
            dashboardPlaceholder.style.display = 'none';
            dashboardContent.style.display = 'block';
            execIdBanner.textContent = `Workflow Execution: ${executionId}`;
            workflowStatusBadge.textContent = 'RUNNING';
            workflowStatusBadge.className = 'badge';
            workflowPulse.className = 'pulse-indicator status-live';
            const currentStatusLabel = document.getElementById('currentStatusLabel');
            if (currentStatusLabel) currentStatusLabel.textContent = 'Running...';

            // Clear prior states
            logsFeed.innerHTML = '';
            resultCard.style.display = 'none';
            auditTrailText.textContent = '';

            resetFlowchart();

            // Set up SSE Event Stream connection
            connectSSE(executionId);

        } catch (err) {
            alert(`Error launching workspace workflow: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    });

    const stepIdMaps = {
        'step-identity': 'node-identity',
        'step-document': 'node-document',
        'step-registry': 'node-registry',
        'step-research': 'node-research'
    };

    const connectorMaps = {
        'step-identity': 'connector-2',
        'step-document': 'connector-3',
        'step-registry': 'connector-4',
        'step-research': 'connector-5'
    };

    function resetFlowchart() {
        // Reset all nodes
        const nodes = ['node-start', 'node-identity', 'node-document', 'node-registry', 'node-research', 'node-judge'];
        nodes.forEach(n => {
            const el = document.getElementById(n);
            if (el) {
                el.className = 'flowchange-node';
                const col = el.querySelector('.node-state-color');
                if (col) col.className = 'node-state-color state-pending';
            }
        });

        // Reset connectors
        const connectors = ['connector-1', 'connector-2', 'connector-3', 'connector-4', 'connector-5'];
        connectors.forEach(c => {
            const el = document.getElementById(c);
            if (el) el.className = 'flowchart-connector';
        });
    }

    function getStepTitle(stepId) {
        const maps = {
            'step-identity': 'Identity Check',
            'step-document': 'Document Validation',
            'step-registry': 'Registry Check',
            'step-research': 'Precedent Research'
        };
        return maps[stepId] || stepId;
    }

    function addLogEntry(title, status, isCompleted = false, isWorkflow = false) {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        const div = document.createElement('div');
        div.className = 'log-item';
        if (isCompleted) div.classList.add('completed');
        if (isWorkflow) div.classList.add('workflow');

        let color = 'var(--text-muted)';
        if (status === 'Completed' || status === 'Accepted') color = 'var(--green)';
        else if (status === 'Failed' || status === 'Error') color = 'var(--red)';
        else if (status === 'Started') color = 'var(--accent)';

        div.innerHTML = `
            <div class="log-time" style="font-weight:600; color:var(--accent); font-size:0.75rem;">${timeStr}</div>
            <div class="log-title" style="font-weight:700; color:var(--text-main); font-size:0.95rem; margin-top:2px;">${title}</div>
            <div class="log-status" style="font-weight:600; font-size:0.8rem; margin-top:1px; color:${color};">${status}</div>
            <hr style="border:none; border-top:1px solid rgba(255, 255, 255, 0.05); margin: 8px 0; outline:none; height:0;">
        `;
        logsFeed.appendChild(div);
        logsFeed.scrollTop = logsFeed.scrollHeight;
    }

    function connectSSE(executionId) {
        const source = new EventSource(`/workflow/${executionId}/live`);

        source.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('SSE message:', data);

            if (data.type === 'Connected') {
                addLogEntry('System Event Bus', 'Connected', false, true);
                return;
            }

            // Handle normal events
            const type = data.type;
            const payload = data.payload || {};

            if (type === 'WorkflowStarted') {
                addLogEntry('Workflow Status', 'Started', false, true);

                // Set start node to done
                const startNode = document.getElementById('node-start');
                if (startNode) {
                    startNode.classList.add('done');
                    const color = startNode.querySelector('.node-state-color');
                    if (color) color.className = 'node-state-color state-completed';
                }
                const conn1 = document.getElementById('connector-1');
                if (conn1) conn1.classList.add('active');
            }
            else if (type === 'AgentStarted') {
                const nodeId = stepIdMaps[payload.stepId];
                const nodeEl = document.getElementById(nodeId);
                if (nodeEl) {
                    nodeEl.classList.add('active');
                    const color = nodeEl.querySelector('.node-state-color');
                    if (color) color.className = 'node-state-color'; // handled by active class css
                }

                // Update preceding connectors
                if (payload.stepId === 'step-identity') {
                    const conn = document.getElementById('connector-1');
                    if (conn) conn.className = 'flowchart-connector active';
                } else if (payload.stepId === 'step-document') {
                    const conn = document.getElementById('connector-2');
                    if (conn) conn.className = 'flowchart-connector active';
                } else if (payload.stepId === 'step-registry') {
                    const conn = document.getElementById('connector-3');
                    if (conn) conn.className = 'flowchart-connector active';
                } else if (payload.stepId === 'step-research') {
                    const conn = document.getElementById('connector-4');
                    if (conn) conn.className = 'flowchart-connector active';
                }

                const title = getStepTitle(payload.stepId);
                addLogEntry(title, 'Started');

                const currentStatusLabel = document.getElementById('currentStatusLabel');
                if (currentStatusLabel) currentStatusLabel.textContent = `Running (${title})...`;
            }
            else if (type === 'AgentCompleted') {
                const nodeId = stepIdMaps[payload.stepId];
                const nodeEl = document.getElementById(nodeId);
                if (nodeEl) {
                    nodeEl.classList.remove('active');
                    nodeEl.classList.add('done');
                    const color = nodeEl.querySelector('.node-state-color');
                    if (color) color.className = 'node-state-color state-completed';
                }

                // Update preceding connector to done
                if (payload.stepId === 'step-identity') {
                    const conn = document.getElementById('connector-1');
                    if (conn) conn.className = 'flowchart-connector done';
                    const nextConn = document.getElementById('connector-2');
                    if (nextConn) nextConn.className = 'flowchart-connector active';
                } else if (payload.stepId === 'step-document') {
                    const conn = document.getElementById('connector-2');
                    if (conn) conn.className = 'flowchart-connector done';
                    const nextConn = document.getElementById('connector-3');
                    if (nextConn) nextConn.className = 'flowchart-connector active';
                } else if (payload.stepId === 'step-registry') {
                    const conn = document.getElementById('connector-3');
                    if (conn) conn.className = 'flowchart-connector done';
                    const nextConn = document.getElementById('connector-4');
                    if (nextConn) nextConn.className = 'flowchart-connector active';
                } else if (payload.stepId === 'step-research') {
                    const conn = document.getElementById('connector-4');
                    if (conn) conn.className = 'flowchart-connector done';
                    const nextConn = document.getElementById('connector-5');
                    if (nextConn) nextConn.className = 'flowchart-connector active';
                }

                const title = getStepTitle(payload.stepId);
                const status = payload.stepId === 'step-registry' ? 'Accepted' : 'Completed';
                addLogEntry(title, status, true);
            }
            else if (type === 'WorkflowCompleted') {
                addLogEntry('Dispute Resolution', 'Completed', true, true);

                // Show final result
                workflowStatusBadge.textContent = 'COMPLETED';
                workflowStatusBadge.className = 'badge completed';
                workflowPulse.className = 'pulse-indicator status-inactive';

                const currentStatusLabel = document.getElementById('currentStatusLabel');
                if (currentStatusLabel) currentStatusLabel.textContent = 'Completed';

                // Mark final nodes
                const judgeNode = document.getElementById('node-judge');
                if (judgeNode) {
                    judgeNode.classList.add('done');
                    const color = judgeNode.querySelector('.node-state-color');
                    if (color) color.className = 'node-state-color state-completed';
                }
                const conn5 = document.getElementById('connector-5');
                if (conn5) conn5.className = 'flowchart-connector done';

                resultCard.style.display = 'block';
                auditTrailText.textContent = data.resultText || 'Trace timeline complete.';
                resultCard.scrollIntoView({ behavior: 'smooth' });

                source.close();
            }
            else if (type === 'WorkflowFailed') {
                addLogEntry('Workflow Execution', 'Failed', false, true);

                workflowStatusBadge.textContent = 'FAILED';
                workflowStatusBadge.className = 'badge failed';
                workflowPulse.className = 'pulse-indicator status-inactive';

                const currentStatusLabel = document.getElementById('currentStatusLabel');
                if (currentStatusLabel) currentStatusLabel.textContent = 'Failed';

                // Find active node and mark failed
                const activeNode = document.querySelector('.flowchange-node.active');
                if (activeNode) {
                    activeNode.classList.remove('active');
                    activeNode.classList.add('failed');
                    const color = activeNode.querySelector('.node-state-color');
                    if (color) color.className = 'node-state-color state-failed';
                }

                source.close();
            }
        };

        source.onerror = (err) => {
            console.error('SSE Connection error:', err);
            addLogEntry('System Event Bus', 'Error', false, true);
            source.close();
        };
    }
});
