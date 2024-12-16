import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import Document from './document/document.jsx';

const getExampleDocument = () => ({
    title: 'Example Document',
    content:                  
            'Lorem ipsum odor amet, consectetuer adipiscing elit. Auctor fermentum dapibus tempus ac lobortis magnis leo. Pretium ultricies eleifend hac justo leo ex taciti. Orci suscipit duis mollis mollis a venenatis aliquet leo. Fermentum malesuada habitasse non adipiscing penatibus inceptos. Turpis in id vestibulum taciti sit a.\
            Posuere dis dictum duis, ornare curabitur himenaeos elit. Ridiculus rutrum faucibus ex dis imperdiet. Luctus purus tempor sagittis diam rutrum cras volutpat. Tempus rhoncus pharetra dis praesent adipiscing suspendisse curae. Velit iaculis massa condimentum primis sollicitudin ullamcorper. Facilisis nullam massa mollis turpis rutrum natoque. Orci rutrum morbi phasellus vestibulum condimentum eleifend ornare nisi gravida.\
            Neque molestie sapien hendrerit torquent facilisi habitant taciti hac cubilia. Metus gravida viverra urna fringilla tincidunt conubia. Mauris fusce hac et donec eu vehicula ex duis. Purus imperdiet ultricies ultricies libero lorem fermentum. Odio sapien libero dapibus erat inceptos. Senectus nullam tortor nunc laoreet malesuada laoreet consectetur. Convallis in rutrum et netus eleifend conubia aliquam conubia.\
            Sociosqu ex nostra consectetur semper ad habitasse. Suscipit est urna erat eros in. Tellus felis auctor tempor auctor nulla posuere facilisis tempus iaculis. Consectetur etiam morbi nulla laoreet molestie duis. Commodo dignissim himenaeos nisi nullam nulla dictum dictum. Dignissim augue porta nullam nec sed, rutrum et nibh fames. Bibendum tempus tempus rutrum class nec nunc phasellus primis habitant. Metus sollicitudin nisi mattis auctor ut morbi.\
            Taciti vel semper etiam morbi amet. Vitae venenatis litora nisl rutrum penatibus nisi egestas habitasse vehicula. Neque velit velit potenti pharetra curae morbi. Molestie ante vitae rhoncus iaculis sit proin turpis nibh suspendisse. Viverra aenean malesuada elit varius mauris id? Commodo sed habitant fringilla tempor donec. Arcu inceptos maximus bibendum vitae posuere feugiat sit dictum.\
            Congue gravida vehicula arcu ultrices nullam. Adipiscing tempor dolor conubia; ridiculus adipiscing at eget. Ac hac sed hendrerit adipiscing auctor nisi nunc sociosqu. Ligula suscipit sem sed parturient elit diam himenaeos? Sapien auctor felis mollis mollis fames lorem. Non dis felis per sollicitudin; ipsum tincidunt nam molestie. Fermentum magna condimentum; aptent lobortis euismod vivamus. Pulvinar scelerisque commodo, habitasse convallis maecenas ultrices eleifend massa. Vestibulum molestie dis vel nam fringilla tristique elit. Ullamcorper vulputate torquent condimentum luctus gravida maximus.\
            Facilisi dictumst proin aenean dignissim semper est dis? Tortor tortor ante phasellus a quis rutrum facilisis neque primis. Blandit quisque porttitor risus scelerisque ante varius. Taciti euismod faucibus lacinia class ullamcorper turpis integer est. Diam netus fames dictumst penatibus phasellus dictum. Accumsan inceptos sollicitudin urna volutpat enim sapien efficitur. Scelerisque curabitur commodo curabitur ut tincidunt. Malesuada potenti rutrum amet nulla luctus torquent.\
            Gravida hendrerit rutrum varius torquent mollis pulvinar eros id. Porttitor integer id sit lorem, mattis per. Lacinia efficitur ipsum per eleifend dolor interdum fusce. Non senectus in urna fringilla nam. Primis taciti rhoncus nullam eget justo justo. Placerat penatibus nec tempus lacinia cursus nullam proin. Imperdiet urna maecenas risus hendrerit metus consectetur sodales. Taciti maecenas blandit tellus tempor netus class nascetur varius parturient. Nam eu vulputate ac inceptos vulputate orci mauris.\
            Inceptos urna natoque feugiat senectus ex non id velit laoreet. Himenaeos nibh vivamus porttitor, ac libero curabitur. Pellentesque sem lorem facilisis semper lobortis euismod. Lacinia sem nascetur malesuada convallis ipsum in cras cursus. Posuere convallis viverra ex eget suscipit tincidunt. Quis dolor euismod scelerisque metus feugiat.\
            Eget vulputate maecenas commodo ac facilisis condimentum augue integer. Adipiscing enim odio vel tellus leo placerat etiam sodales. Habitant sagittis condimentum inceptos ad id; ultricies vulputate eros. Integer fames penatibus sit aliquam class sagittis. Eleifend euismod curae bibendum etiam vulputate porta. Vestibulum eget fringilla; dapibus tristique ad pretium semper arcu nisi.'        
    }
);



const DocumentComponent = (document) => {
  return (
    <div className='flex flex-col'
      style={{
        width: '300px',
        height: '300px',
        margin: '10px',
        padding: '10px',
        border: '1px solid black',
        borderRadius: '10px'
      }}

      onClick={() => {
        window.location.href = `/documents/${document.document._id}`;
      }}
    >
      <div className='flex flex-col bg-white p-4 shadow-md rounded h-4/5'>
      </div>
      <h1
        className='text-xl font-bold'
        style={{
          textAlign: 'center',
          color: 'black',
          margin: '10px'
        }}
      >{document.document.title}</h1>
    </div>
    );
}


export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function fetchDocuments(user) {
      const response = await fetch('http://127.0.0.1:3000/user/get_documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('read-ease-token')}`,
        },
        body: JSON.stringify({
          uid: localStorage.getItem('read-ease-uid'),
        }),
      });

      if (response.status == 200){
        const data = await response.json();
        setDocuments(data);
      }
      
      
    }

    fetchDocuments();
  }, []);

  async function addDocument() {

    console.log(localStorage.getItem('read-ease-token'));

    const response = await fetch('http://127.0.0.1:3000/user/add_document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('read-ease-token')}`,
      },
      body: JSON.stringify({
        uid: localStorage.getItem('read-ease-uid'),
      }),
    });
    // const data = await response.json();
    console.log(await response.text());

    const newDocument = {
    id: documents.length + 1,
    title: 'New Document',
    };
    setDocuments([...documents, newDocument]);
    // return data;
  }

  return (
    <div className='flex flex-row flex-wrap'>

      {documents.map((document) => (                  
        <DocumentComponent key={document.id} document={document} />
      ))}

      <button
        onClick={() => {
          addDocument();
          
        }}
        style={{
          width: '300px',
          height: '50px',
          margin: '10px',
          padding: '10px',
          border: '1px solid black',
          borderRadius: '10px',
          backgroundColor: 'white',
          cursor: 'pointer',
        }}
      >
        Add Document
      </button>
      
    </div>
  );
}