import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';


const initialDataList = [];



function App() {
  const [dataList, setDataList] = useState(initialDataList);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRow, setEditedRow] = useState(null);
  const [alerts, setAlerts] = useState([]);


  const showAlert = (message, type = 'info') => {
    setAlerts([...alerts, { message, type }]);
  };


  const handleEdit = (rowIndex) => {
    setIsEditing(true);
    setEditedRow(rowIndex);
  };


  const handleSave = () => {
    setIsEditing(false);
    setEditedRow(null);
  };


  const handleChange = (e, rowIndex) => {
    const { name, value } = e.target;
    const newDataList = [...dataList];
    newDataList[rowIndex] = { ...newDataList[rowIndex], [name]: value };
    setDataList(newDataList);
  };


  const handleDelete = (rowIndex) => {
    const newDataList = [...dataList];
    newDataList.splice(rowIndex, 1);
    setDataList(newDataList);
    setEditedRow(null);
    showAlert('Row deleted successfully!', 'success');
  };



  const handleDownload = (rowIndex) => {
    if (rowIndex < 0 || rowIndex >= dataList.length) {
      showAlert('Invalid row index.');
      return;
    }


    const specificData = dataList[rowIndex];
    const jsonData = JSON.stringify(specificData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    a.download = `user_info_${rowIndex + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert(`File downloaded successfully: user_info_${rowIndex + 1}.json`, 'success');
  };


  const handleDownloadAll = () => {
    if (dataList.length === 0) {
      showAlert('No data to download.', 'danger');
      return;
    }



    const allDataJson = JSON.stringify(dataList, null, 2);
    const allDataBlob = new Blob([allDataJson], { type: 'application/json' });
    const allDataURL = URL.createObjectURL(allDataBlob);
    const a = document.createElement('a');
    a.href = allDataURL;
    a.download = 'all_user_info.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(allDataURL);
    showAlert('All data downloaded successfully: all_user_info.json', 'success');

  };

  
  const handleFileUpload = (e) => {
    const files = e.target.files;

    if (files.length === 0) {
      showAlert('Please select at least one file.', 'danger');
      return;
    }


    const newDataList = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.type !== 'application/json') {
        showAlert(`File '${file.name}' is not a valid JSON file.`, 'danger');
        continue;
      }


      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const uploadedData = JSON.parse(event.target.result);

          if (Object.values(uploadedData).some((value) => value === '')) {
            showAlert(`File '${file.name}' contains empty values. Please upload a file with non-empty values.`, 'danger');
            return;
          }



          newDataList.push(uploadedData);
          setDataList([...dataList, ...newDataList]);
          
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          showAlert(`Error parsing JSON file '${file.name}'.`, 'danger');
        }
      };

      reader.readAsText(file);
    }
  };


  console.log(dataList)

  return (
    <div className="container mt-4">
      {alerts.map((alert, index) => (
        <div key={index} className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setAlerts(alerts.slice(0, index).concat(alerts.slice(index + 1)))}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      ))}
      <h1 style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>JSON File Uploads</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          { dataList && dataList.map((data, rowIndex) => (
            
            <tr key={rowIndex}>
              {Object.entries(data).map(([key, value]) => (
                <React.Fragment key={key}>
                  <td>
                    {isEditing && editedRow === rowIndex ? (
                      <input
                        type="text"
                        className="form-control"
                        name={key}
                        value={value}
                        onChange={(e) => handleChange(e, rowIndex)}
                      />
                    ) : (
                      value
                    )}
                  </td>
                </React.Fragment>
              ))}

              <td>
                {isEditing && editedRow === rowIndex ? (
                  <React.Fragment>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>
                      Save
                    </button>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <button className="btn btn-info btn-sm" onClick={() => handleEdit(rowIndex)}>
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm ml-2"
                      onClick={() => handleDelete(rowIndex)}
                      disabled={isEditing}
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="btn btn-success btn-sm ml-2"
                      onClick={() => handleDownload(rowIndex)}
                      disabled={isEditing}
                    >
                      <FaDownload />
                    </button>
                  </React.Fragment>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      <div className="mb-3">
        <label htmlFor="fileInput" className="form-label">
          Upload JSON Files
        </label>
        <div className="input-group">
          <input
            type="file"
            className="form-control-file"
            id="fileInput"
            accept=".json"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button className="btn btn-success ml-2" onClick={() => document.getElementById('fileInput').click()}>
            Upload
          </button>
        </div>
      </div>

      {dataList.length > 0 && (
        <React.Fragment>
          <div style={{ alignItems: "right", justifyContent: "right", display: "flex" }}>
            <button className="btn btn-success ml-2" onClick={handleDownloadAll}>
              Download All
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default App;
