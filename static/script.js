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