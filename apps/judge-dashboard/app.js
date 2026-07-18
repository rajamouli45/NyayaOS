document.addEventListener('DOMContentLoaded', () => {
    const caseList = document.getElementById('caseList');
    const dashboardIdle = document.getElementById('dashboardIdle');
    const caseDetails = document.getElementById('caseDetails');

    // Sidebar search and filter elements
    const searchBar = document.getElementById('searchBar');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');

    // Global KPI elements
    const metricTotal = document.getElementById('metric-total');
    const metricCompleted = document.getElementById('metric-completed');
    const metricFailed = document.getElementById('metric-failed');
    const metricTime = document.getElementById('metric-time');
    const metricConfidence = document.getElementById('metric-confidence');

    // Case Details UI fields
    const caseHeading = document.getElementById('caseHeading');
    const caseDateLabel = document.getElementById('caseDateLabel');
    const execIdLabel = document.getElementById('execIdLabel');
    const caseStatusBadge = document.getElementById('caseStatusBadge');

    // Demographics/Case Summary fields
    const caseIdVal = document.getElementById('caseIdVal');
    const caseTypeVal = document.getElementById('caseTypeVal');
    const courtVal = document.getElementById('courtVal');
    const filingDateVal = document.getElementById('filingDateVal');
    const assignedJudgeVal = document.getElementById('assignedJudgeVal');
    const priorityVal = document.getElementById('priorityVal');
    const currentStageVal = document.getElementById('currentStageVal');
    const judicialStatusVal = document.getElementById('judicialStatusVal');
    const hearingDateVal = document.getElementById('hearingDateVal');
    const lastUpdatedVal = document.getElementById('lastUpdatedVal');
    const descriptionVal = document.getElementById('descriptionVal');

    // Parties fields
    const plaintiffNameVal = document.getElementById('plaintiffNameVal');
    const plaintiffIdVal = document.getElementById('plaintiffIdVal');
    const defendantNameVal = document.getElementById('defendantNameVal');
    const defendantIdVal = document.getElementById('defendantIdVal');

    // Property fields
    const propPlotIdVal = document.getElementById('propPlotIdVal');
    const propSurveyVal = document.getElementById('propSurveyVal');
    const propRegNoVal = document.getElementById('propRegNoVal');
    const propAreaVal = document.getElementById('propAreaVal');
    const propVillageVal = document.getElementById('propVillageVal');
    const propDistrictStateVal = document.getElementById('propDistrictStateVal');
    const propOwnerVal = document.getElementById('propOwnerVal');
    const propRegDateVal = document.getElementById('propRegDateVal');

    // Checklist Container
    const evidenceListContainer = document.getElementById('evidenceListContainer');

    // AI recommendation elements
    const aiRecStatusVal = document.getElementById('aiRecStatusVal');
    const aiRecConfidenceVal = document.getElementById('aiRecConfidenceVal');
    const aiRecRiskVal = document.getElementById('aiRecRiskVal');
    const aiRecSummaryVal = document.getElementById('aiRecSummaryVal');

    // Risk assessment fields
    const riskIdentityVal = document.getElementById('riskIdentityVal');
    const riskDuplicateVal = document.getElementById('riskDuplicateVal');
    const riskRegistryVal = document.getElementById('riskRegistryVal');
    const riskEvidenceVal = document.getElementById('riskEvidenceVal');
    const riskOverallVal = document.getElementById('riskOverallVal');

    // Verification outcomes fields
    const checkIdentityVal = document.getElementById('checkIdentityVal');
    const checkRegistryVal = document.getElementById('checkRegistryVal');
    const checkEncumbranceVal = document.getElementById('checkEncumbranceVal');
    const checkDuplicateVal = document.getElementById('checkDuplicateVal');
    const checkOwnershipVal = document.getElementById('checkOwnershipVal');

    // Section lists
    const precedentsContainer = document.getElementById('precedentsContainer');
    const confidenceContainer = document.getElementById('confidenceContainer');
    const timelineLogs = document.getElementById('timelineLogs');
    const auditTrailText = document.getElementById('auditTrailText');
    const downloadReportBtn = document.getElementById('downloadReportBtn');

    let activeCaseId = null;
    let cachedCases = [];

    // Load Case List on Sidebar
    async function loadCases() {
        try {
            const res = await fetch('/workflows');
            if (!res.ok) throw new Error('Failed to fetch case list');

            const newCases = await res.json();
            if (cachedCases.length > 0) {
                newCases.forEach(nc => {
                    const exists = cachedCases.some(oc => oc.executionId === nc.executionId);
                    if (!exists) {
                        showToast(`⚖️ New Case Filed: ${nc.citizenName || 'Applicant'} (${nc.executionId})`);
                    }
                });
            }
            cachedCases = newCases;

            // Calculate and update global KPI metrics
            updateGlobalKPIs(cachedCases);

            // Render filtered cases list
            renderCasesList();

            // Auto-refresh active case details in real-time if a case is currently selected
            if (activeCaseId) {
                loadCaseDetails(activeCaseId, true);
            }
        } catch (err) {
            console.error('Error loading cases:', err);
            caseList.innerHTML = `<div class="case-list-loading" style="color:var(--red);">Error loading registry data.</div>`;
        }
    }

    function showToast(message) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.background = 'rgba(22, 24, 30, 0.95)';
        toast.style.borderLeft = '4px solid hsl(250, 85%, 65%)';
        toast.style.color = '#fff';
        toast.style.padding = '12px 18px';
        toast.style.borderRadius = '6px';
        toast.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.5)';
        toast.style.fontSize = '0.9rem';
        toast.style.fontWeight = '600';
        toast.style.fontFamily = 'var(--font-body)';
        toast.style.minWidth = '280px';
        toast.style.display = 'flex';
        toast.style.justifyContent = 'space-between';
        toast.style.alignItems = 'center';
        toast.style.animation = 'slideIn 0.3s ease forwards';
        toast.style.border = '1px solid rgba(255, 255, 255, 0.1)';

        toast.innerHTML = `
            <span>${message}</span>
            <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-left:15px; font-weight:700;" onclick="this.parentElement.remove()">✕</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    function renderCasesList() {
        const query = searchBar.value.trim().toLowerCase();
        const statusVal = statusFilter.value;
        const typeVal = typeFilter.value;

        // Filter operations
        const filtered = cachedCases.filter(c => {
            // Search name or ID
            const nameMatch = c.citizenName && c.citizenName.toLowerCase().includes(query);
            const idMatch = c.executionId && c.executionId.toLowerCase().includes(query);
            if (query && !nameMatch && !idMatch) return false;

            // Status match
            if (statusVal !== 'ALL') {
                if (c.status !== statusVal) return false;
            }

            // Type match
            if (typeVal !== 'ALL') {
                if (c.caseType !== typeVal) return false;
            }

            return true;
        });

        caseList.innerHTML = '';

        if (filtered.length === 0) {
            caseList.innerHTML = '<div class="case-list-loading">No matching cases found.</div>';
            return;
        }

        filtered.forEach(c => {
            const btn = document.createElement('button');
            btn.className = `case-item ${activeCaseId === c.executionId ? 'active' : ''}`;

            const timeStr = new Date(c.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(c.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

            const statusClass = c.status.toLowerCase();

            btn.innerHTML = `
                <div class="case-item-header">
                    <span class="case-id-text">${c.executionId}</span>
                    <span class="case-status-dot ${statusClass}"></span>
                </div>
                <div class="case-citizen-name">${escapeHtml(c.citizenName)}</div>
                <div class="case-time-ago">${dateStr} at ${timeStr}</div>
            `;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.case-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadCaseDetails(c.executionId);
            });

            caseList.appendChild(btn);
        });
    }

    function updateGlobalKPIs(cases) {
        const total = cases.length;
        const completed = cases.filter(c => c.status === 'COMPLETED').length;
        const failed = cases.filter(c => c.status === 'FAILED').length;

        // Compute runtime and confidence averages
        let totalRuntime = 0;
        let completedCount = 0;
        let totalConfidence = 0;
        let confidenceCount = 0;

        cases.forEach(c => {
            if (c.status === 'COMPLETED') {
                completedCount++;
                if (c.metrics && c.metrics.totalDurationMs) {
                    totalRuntime += c.metrics.totalDurationMs;
                } else if (c.duration) {
                    totalRuntime += c.duration;
                } else {
                    totalRuntime += 1140; // Sensible default execution duration
                }
            }

            // Estimate confidence average
            if (c.confidence) {
                totalConfidence += c.confidence;
                confidenceCount++;
            } else if (c.metrics && c.metrics.steps) {
                let stepConfSum = 0;
                let stepValidCount = 0;
                c.metrics.steps.forEach(s => {
                    if (typeof s.confidence === 'number') {
                        stepConfSum += s.confidence;
                        stepValidCount++;
                    }
                });
                if (stepValidCount > 0) {
                    totalConfidence += (stepConfSum / stepValidCount);
                    confidenceCount++;
                }
            }
        });

        const avgTime = completedCount > 0 ? Math.round(totalRuntime / completedCount) : 0;
        const avgConfidence = confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 100) : 85;

        metricTotal.textContent = total;
        metricCompleted.textContent = completed;
        metricFailed.textContent = failed;
        metricTime.textContent = `${avgTime}ms`;
        metricConfidence.textContent = `${avgConfidence}%`;
    }

    // Attach search and filter events
    searchBar.addEventListener('input', renderCasesList);
    statusFilter.addEventListener('change', renderCasesList);
    typeFilter.addEventListener('change', renderCasesList);

    // Load Single Case Details
    async function loadCaseDetails(executionId, quiet = false) {
        activeCaseId = executionId;
        dashboardIdle.style.display = 'none';
        caseDetails.style.display = 'block';

        if (!quiet) {
            // Clear sub containers
            evidenceListContainer.innerHTML = '';
            precedentsContainer.innerHTML = '';
            confidenceContainer.innerHTML = '';
            timelineLogs.innerHTML = '';
            auditTrailText.textContent = 'Generating Explainability Analysis...';
        }

        try {
            const res = await fetch(`/workflow/${executionId}`);
            if (!res.ok) throw new Error('Failed to fetch case data');
            const data = await res.json();

            // Populate Main Header
            caseHeading.textContent = `Case Ref: ${data.case.caseId}`;
            caseDateLabel.textContent = data.case.lastUpdated;
            execIdLabel.textContent = data.case.caseId;

            // Map core workflow status to UI status badging
            let badgeClass = 'PENDING';
            if (data.summary.status === 'COMPLETED') badgeClass = 'COMPLETED';
            else if (data.summary.status === 'FAILED') badgeClass = 'FAILED';
            caseStatusBadge.textContent = data.summary.status;
            caseStatusBadge.className = `badge-status ${badgeClass}`;

            // 1. Populate Case Summary
            caseIdVal.textContent = data.case.caseId;
            caseTypeVal.textContent = data.case.caseType;
            courtVal.textContent = data.case.court;
            filingDateVal.textContent = data.case.filingDate;
            assignedJudgeVal.textContent = data.case.assignedJudge;
            priorityVal.textContent = data.case.priority;
            currentStageVal.textContent = data.case.currentStage;
            judicialStatusVal.textContent = data.case.status;
            hearingDateVal.textContent = data.case.hearingDate;
            lastUpdatedVal.textContent = data.case.lastUpdated;
            descriptionVal.textContent = data.summary.description;

            // 2. Populate Parties Involved
            plaintiffNameVal.textContent = data.parties.plaintiffName;
            plaintiffIdVal.textContent = data.parties.plaintiffId;
            defendantNameVal.textContent = data.parties.defendantName;
            defendantIdVal.textContent = data.parties.defendantId;

            // 3. Populate Property Information
            propPlotIdVal.textContent = data.property.plotId;
            propSurveyVal.textContent = data.property.surveyNumber;
            propRegNoVal.textContent = data.property.registrationNumber;
            propAreaVal.textContent = data.property.propertyArea;
            propVillageVal.textContent = data.property.propertyVillage;
            propDistrictStateVal.textContent = `${data.property.propertyDistrict}, ${data.property.propertyState}`;
            propOwnerVal.textContent = data.property.currentOwner;
            propRegDateVal.textContent = data.property.registrationDate;

            // Pipeline Replaced with Horizontal Live Flowchart Graph
            updateHorizontalFlowchart(data);

            if (quiet) {
                // If quiet loading, clear containers right before rendering to prevent flickering
                evidenceListContainer.innerHTML = '';
                precedentsContainer.innerHTML = '';
                confidenceContainer.innerHTML = '';
                timelineLogs.innerHTML = '';
            }

            // 4. Evidence checklist
            const checkFiles = [
                { key: 'Sale Deed', test: data.verification.ownershipMatch === 'Confirmed' },
                { key: 'Aadhaar Card', test: data.verification.identity === 'Verified' },
                { key: 'Tax Receipt', test: data.verification.registryMatch === 'Verified' },
                { key: 'Khata Certificate', test: data.verification.registryMatch === 'Verified' },
                { key: 'Encumbrance Certificate', test: data.verification.registryMatch === 'Verified' }
            ];

            checkFiles.forEach(file => {
                const item = document.createElement('div');
                item.className = 'demo-item';
                const fileIcon = file.test ? '✓' : '⏳';
                const statusColor = file.test ? '#34d399' : 'var(--text-muted)';
                item.innerHTML = `
                    <span class="demo-key" style="color: ${statusColor};">📄 ${file.key}</span>
                    <span class="demo-val" style="color: ${statusColor};">${fileIcon} Verified</span>
                `;
                evidenceListContainer.appendChild(item);
            });

            // 5. Verification Results
            checkIdentityVal.innerHTML = data.verification.identity === 'Verified' ? '<span style="color:#34d399;">✅ Verified</span>' : '<span style="color:#f87171;">✕ Failed</span>';
            checkRegistryVal.innerHTML = data.verification.registryMatch === 'Verified' ? '<span style="color:#34d399;">✅ Verified</span>' : '<span style="color:#f87171;">✕ Failed</span>';
            checkEncumbranceVal.innerHTML = data.verification.encumbrance === 'Clear' ? '<span style="color:#34d399;">✅ Clear</span>' : '<span style="color:#f87171;">✕ Issues</span>';
            checkDuplicateVal.innerHTML = data.verification.duplicateClaim === 'None' ? '<span style="color:#34d399;">✅ None</span>' : '<span style="color:#f87171;">✕ Conflict</span>';
            checkOwnershipVal.innerHTML = data.verification.ownershipMatch === 'Confirmed' ? '<span style="color:#34d399;">✅ Confirmed</span>' : '<span style="color:#f87171;">✕ Failed</span>';

            // 6. AI Recommendation Card
            aiRecStatusVal.textContent = data.recommendation.status;
            aiRecConfidenceVal.textContent = `${data.recommendation.confidence}%`;
            aiRecRiskVal.textContent = data.recommendation.risk;
            if (data.recommendation.risk === 'HIGH') {
                aiRecRiskVal.style.color = 'var(--red)';
            } else {
                aiRecRiskVal.style.color = '#34d399';
            }

            aiRecSummaryVal.innerHTML = '';
            data.recommendation.summaryBullets.forEach(bullet => {
                const bulletEl = document.createElement('div');
                bulletEl.style.marginBottom = '6px';
                bulletEl.innerHTML = `• ${escapeHtml(bullet)}`;
                aiRecSummaryVal.appendChild(bulletEl);
            });

            // 7. Risk Assessment Card
            riskIdentityVal.innerHTML = data.risk.identityFraud === 'None' ? '<span style="color:#34d399;">None</span>' : `<span style="color:#f87171;">${escapeHtml(data.risk.identityFraud)}</span>`;
            riskDuplicateVal.innerHTML = data.risk.duplicateRegistration === 'None' ? '<span style="color:#34d399;">None</span>' : `<span style="color:#f87171;">${escapeHtml(data.risk.duplicateRegistration)}</span>`;
            riskRegistryVal.innerHTML = data.risk.registryConflict === 'None' ? '<span style="color:#34d399;">None</span>' : `<span style="color:#f87171;">${escapeHtml(data.risk.registryConflict)}</span>`;
            riskEvidenceVal.innerHTML = data.risk.evidenceGaps === 'None' ? '<span style="color:#34d399;">None</span>' : `<span style="color:#f87171;">${escapeHtml(data.risk.evidenceGaps)}</span>`;

            riskOverallVal.textContent = data.risk.overallRisk;
            if (data.risk.overallRisk === 'HIGH') {
                riskOverallVal.style.color = 'var(--red)';
            } else {
                riskOverallVal.style.color = '#34d399';
            }

            // Precedents Brief Card
            if (data.precedents && data.precedents.length > 0) {
                data.precedents.forEach(p => {
                    const card = document.createElement('div');
                    card.className = 'precedents-card';
                    card.innerHTML = `
                        <div class="prec-title">💼 ${escapeHtml(p.precedentName)}</div>
                        <div class="prec-meta">Case Number: ${escapeHtml(p.caseNumber)}</div>
                        <div class="prec-badge-section">Act: ${escapeHtml(p.statuteDetails.act)} (Sec: ${escapeHtml(p.statuteDetails.section)})</div>
                    `;
                    precedentsContainer.appendChild(card);
                });
            } else {
                precedentsContainer.innerHTML = '<div class="precedents-card prec-meta">No legal precedents identified.</div>';
            }

            // Confidence progress bars
            data.metrics.steps.forEach(s => {
                const stepTitle = s.stepId.replace('step-', '').toUpperCase();
                const confidencePct = Math.round(s.confidence * 100);

                const item = document.createElement('div');
                item.className = 'confidence-item';
                item.innerHTML = `
                    <div class="confidence-header">
                        <span class="conf-label">${stepTitle} Verification</span>
                        <span class="conf-val">${confidencePct}%</span>
                    </div>
                    <div class="progressBar-outer">
                        <div class="progressBar-inner" id="progress-bar-${s.stepId}"></div>
                    </div>
                `;
                confidenceContainer.appendChild(item);

                // Animate progress width
                setTimeout(() => {
                    const bar = document.getElementById(`progress-bar-${s.stepId}`);
                    if (bar) {
                        bar.style.width = `${confidencePct}%`;
                    }
                }, 100);
            });

            // Replay Timeline logs
            data.timeline.forEach(evt => {
                const item = document.createElement('div');
                item.className = 'log-feed-item';

                const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                let msgClass = '';
                if (evt.type === 'AgentCompleted' || evt.type === 'WorkflowCompleted') msgClass = 'success';
                else if (evt.type === 'AgentStarted') msgClass = 'running';

                item.innerHTML = `
                    <span class="log-feed-time">[${timeStr}]</span>
                    <span class="log-feed-msg ${msgClass}">${escapeHtml(evt.message)}</span>
                `;
                timelineLogs.appendChild(item);
            });
            timelineLogs.scrollTop = timelineLogs.scrollHeight;

            // Audit text
            auditTrailText.textContent = data.resultText || 'Execution trace logs complete.';

            // Setup report download link
            downloadReportBtn.href = `/workflow/${executionId}/download`;

        } catch (err) {
            console.error('Error loading case detail metrics:', err);
            alert('Failed to load case detail logs.');
        }
    }

    function updateHorizontalFlowchart(data) {
        const steps = data.metrics.steps || [];
        const status = data.summary.status;

        const stepIdMaps = {
            'step-identity': 'node-identity',
            'step-document': 'node-document',
            'step-registry': 'node-registry',
            'step-research': 'node-research'
        };

        // Reset all nodes to pending
        const nodes = ['node-start', 'node-identity', 'node-document', 'node-registry', 'node-research', 'node-judge'];
        nodes.forEach(n => {
            const el = document.getElementById(n);
            if (el) {
                el.className = 'flowchange-node';
                const col = el.querySelector('.node-state-color');
                if (col) col.className = 'node-state-color state-pending';
            }
        });

        // Reset all connectors to pending
        const connectors = ['connector-1', 'connector-2', 'connector-3', 'connector-4', 'connector-5'];
        connectors.forEach(c => {
            const el = document.getElementById(c);
            if (el) el.className = 'flowchart-connector';
        });

        // Submission node is always done
        const startNode = document.getElementById('node-start');
        if (startNode) {
            startNode.classList.add('done');
            const color = startNode.querySelector('.node-state-color');
            if (color) color.className = 'node-state-color state-completed';
        }

        // Make connector-1 active initially
        const conn1 = document.getElementById('connector-1');
        if (conn1) conn1.className = 'flowchart-connector active';

        // Trace steps
        steps.forEach((s, idx) => {
            const nodeId = stepIdMaps[s.stepId];
            if (!nodeId) return;
            const nodeEl = document.getElementById(nodeId);
            if (!nodeEl) return;

            const nodeColor = nodeEl.querySelector('.node-state-color');

            if (s.status === 'RUNNING') {
                nodeEl.classList.add('active');
                if (nodeColor) nodeColor.className = 'node-state-color';

                const conn = document.getElementById(`connector-${idx + 1}`);
                if (conn) conn.className = 'flowchart-connector active';
            } else if (s.status === 'COMPLETED') {
                nodeEl.classList.add('done');
                if (nodeColor) nodeColor.className = 'node-state-color state-completed';

                const connPrev = document.getElementById(`connector-${idx + 1}`);
                if (connPrev) connPrev.className = 'flowchart-connector done';
                const connNext = document.getElementById(`connector-${idx + 2}`);
                if (connNext) connNext.className = 'flowchart-connector active';
            } else if (s.status === 'FAILED') {
                nodeEl.classList.add('failed');
                if (nodeColor) nodeColor.className = 'node-state-color state-failed';

                const connPrev = document.getElementById(`connector-${idx + 1}`);
                if (connPrev) connPrev.className = 'flowchart-connector done';
            }
        });

        // Final judge node status
        const judgeNode = document.getElementById('node-judge');
        const conn5 = document.getElementById('connector-5');
        if (status === 'COMPLETED') {
            if (judgeNode) {
                judgeNode.classList.add('done');
                const color = judgeNode.querySelector('.node-state-color');
                if (color) color.className = 'node-state-color state-completed';
            }
            if (conn5) conn5.className = 'flowchart-connector done';
        } else if (status === 'FAILED') {
            if (conn5 && conn5.className !== 'flowchart-connector done') {
                conn5.className = 'flowchart-connector';
            }
            // Mark active node as failed
            const activeNode = document.querySelector('.horizontal-flowchart .flowchange-node.active');
            if (activeNode) {
                activeNode.classList.remove('active');
                activeNode.classList.add('failed');
                const color = activeNode.querySelector('.node-state-color');
                if (color) color.className = 'node-state-color state-failed';
            }
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Init
    loadCases();
    // Refresh cases index periodically (set to 2 seconds for live hackathon demo flow)
    setInterval(loadCases, 2000);
});
