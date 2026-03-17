function switchTab(name,btn)
{
    document.querySelectorAll('tab.panel').forEach(function(panel){
        panel.classList.remove('active');});

    document.querySelectorAll('tab').forEach(function(tabBtn){
        tabBtn.classList.remove('active');});

        document.getElementById('tab-'+name).classList.add('active');

        btn.classList.add('active');
}
function scoreColor(score)
{
    if (score>=75) 
        return '#00c6ff';
    if(score>=50)
        return '#4f9eff';
    if(score>=30)
        return '#f5a623';
    return '#ff6060';
}
function showError(element,message)
{
    element.textContent='🚫'+message;
    element.style.display='block';
}
function clearError(element)
{
    element.textContent="";
    element.style.display='block';
}
function analyzeResume()
{
    var fileInput =document.getElementById('resumeUpload');
    var jd =document.getElementById('jobDescription').value.trim();
    var errBox    = document.getElementById('error-box');
    var resultsEl = document.getElementById('results');
    var btn       = document.getElementById('single-btn');

     clearError(errBox);
    resultsEl.style.display = 'none';
    if (!fileInput.files.length) 
        {
        showError(errBox, 'Please upload a resume PDF first.');
        return;
        }
    var formData = new FormData();
    formData.append('resume', fileInput.files[0]);
     if (jd) 
        {
        formData.append('job_description', jd);
        }
    btn.disabled = true;
    btn.textContent = 'Analyzing… ⏳';
    fetch('/analyze', { method: 'POST', body: formData })
        .then(function(response) {
            return response.json();
        })
    .then(function(data) {
            if (data.error) {
                showError(errBox, data.error);
                return;}
                renderSingleResult(data, jd.length > 0);
        })
        .catch(function(err) {
            showError(errBox, 'Network error: ' + err.message);
        })
        .finally(function() {
            btn.disabled = false;
            btn.textContent = 'Analyze Resume';
        });
}
function renderSingleResult(data, hasJobDescription) 
{
    var score = data.score || 0;
    var color = scoreColor(score);
     var scoreEl = document.getElementById('score-text');
    scoreEl.textContent = 'Score: ' + score + '/100';
    scoreEl.style.color = color;
    document.getElementById('meta-name').textContent = data.candidate_name || '';
    document.getElementById('meta-exp').textContent  = data.experience_years != null
        ? ''+ data.experience_years + ' years experience'
        : '';
     document.getElementById('meta-edu').textContent  = data.education
        ?'' + data.education
        : '';
    document.getElementById('score-reason').textContent = data.score_reason || '';
    var skillsEl = document.getElementById('skills-tags');
    if (data.skills && data.skills.length) {
        skillsEl.innerHTML = data.skills
            .map(function(skill) {
                return '<span class="tag">' + skill + '</span>';
            })
            .join('');
    } else {
        skillsEl.innerHTML = '<span style="font-size:13px;color:#5a7a90">None detected</span>';
    }
     var missingLabel = document.getElementById('missing-label');
    var missingEl    = document.getElementById('missing-tags');

    if (hasJobDescription && data.missing_skills && data.missing_skills.length) {
        missingLabel.style.display = 'block';
        missingEl.innerHTML = data.missing_skills
            .map(function(skill) {
                return '<span class="tag tag-missing">' + skill + '</span>';
            })
            .join('');
    } else {
        missingLabel.style.display = 'none';
        missingEl.innerHTML = '';
    }

    var suggestionsEl = document.getElementById('suggestions-list');
    if (data.suggestions && data.suggestions.length) {
        suggestionsEl.innerHTML = data.suggestions
            .map(function(tip) {
                return '<li>' + tip + '</li>';
            })
            .join('');
    } else {
        suggestionsEl.innerHTML = '';
    }
   docment.getElementById('results').style.display = 'block';
}
function analyzeBatch() 
{
    var filesInput = document.getElementById('hrUpload');
    var jd         = document.getElementById('hr-jd').value.trim();
    var errBox     = document.getElementById('error-box'); 
    var resultsEl  = document.getElementById('hr-results');
    var btn        = document.getElementById('hr-btn');

     clearError(errBox);
    resultsEl.style.display = 'none';

     if (!filesInput.files.length) 
        {
        showError(errBox, 'Please select at least one PDF resume.');
        return;
        }
    if (!jd) {
        showError(errBox, 'Please paste a job description so candidates can be ranked.');
        return;
    }
     var formData = new FormData();
    Array.from(filesInput.files).forEach(function(file) {
        formData.append('resumes', file);
    });
    formData.append('job_description', jd);

    btn.disabled = true;
    btn.textContent = 'Processing ' + filesInput.files.length + ' resume(s)… ';
    
    fetch('/analyze-batch', { method: 'POST', body: formData })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.error) {
                showError(errBox, data.error);
                return;
            }
            renderDashboard(data);
        })
        .catch(function(err) {
            showError(errBox, 'Network error: ' + err.message);
        })
        .finally(function() {
            btn.disabled = false;
            btn.textContent = 'Rank all Candidates';
        });
}