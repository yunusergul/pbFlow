import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  updateEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from "react-flow-renderer";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToasts } from "react-toast-notifications";
import { IconContext } from "react-icons";
import { VscSettings } from "react-icons/vsc";
import { GiCancel } from "react-icons/gi";
import { Modal, Button, ModalHeader } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
let id = 0;
const getId = () => `new${id++}`;
const initialNodes = [];
const initialEdges = [];

const MermaidFlow = () => {
  const notify = (a) => toast.success(a);
  const [lgShow, setLgShow] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [objectEdit, setObjectEdit] = useState({});
  const onNodesChange = useCallback(
    (changes) => setNodes((ns) => applyNodeChanges(changes, ns)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );

  const onPaneClick = () => setObjectEdit({});
  const onNodeClick = (a, b) => {
    setObjectEdit(b);
  };
  const onEdgeClick = (a, b) => {
    setObjectEdit(b);
  };

  const onEdgeUpdate = (oldEdge, newConnection) =>
    setEdges((els) => updateEdge(oldEdge, newConnection, els));

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `Added node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );
  const DConAdd = useCallback(() => {
    const newNode = {
      id: getId(),
      data: { label: "Added node" },
      position: {
        x: Math.random() * window.innerWidth - 100,
        y: Math.random() * window.innerHeight,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };
  function exportMermaid(n, e) {
    let a = "graph TD";
    n.forEach((element) => {
      let id = element.id;
      let inf = element.data.label;
      a += `\n A${id.toUpperCase()}[${inf}]`;
    });
    e.forEach((element) => {
      let s = element.source;
      let t = element.target;
      let i = element.label ? `|${element.label}|` : "";
      a += `\n A${s.toUpperCase()}-->${i}A${t.toUpperCase()}`;
    });

    navigator.clipboard
      .writeText(a)
      .then(notify("Mermaid code copied to clipboard"));
      console.log(a);
  }
  return (
    <div className="panelF">
      <div>
        <ul>
          <li>
            <div
              title="drag and drop"
              className="dndnode"
              onDragStart={(event) => onDragStart(event, "default")}
              onClick={(e) => {
                if (e.detail == 2) DConAdd();
              }}
              draggable
            >
              Add Node
            </div>
          </li>
          <li>
            <a
              href="#"
              className=""
              onClick={() => {
                exportMermaid(nodes, edges);
              }}
            >
              Export Data
            </a>
          </li>
          <li>
            {objectEdit.data && (
              <>
                <div>
                  <input
                    className="textbox"
                    placeholder="Nodes Value..."
                    value={objectEdit.data.label}
                    onChange={(e) => {
                      const newObjectEdit = objectEdit;
                      newObjectEdit.data.label = e.target.value;
                      setObjectEdit({ ...newObjectEdit });
                      const newNotes = nodes.map((item) => {
                        if (item.id === objectEdit.id) {
                          const newItem = item;
                          newItem.data.label = e.target.value;
                          return { ...newItem };
                        }
                        return item;
                      });
                      setNodes(newNotes);
                    }}
                  />
                  <IconContext.Provider value={{ className: "react-icons" }}>
                    <VscSettings onClick={() => setLgShow(true)} />
                  </IconContext.Provider>
                </div>
              </>
            )}
          </li>
          <li>
            <div></div>
          </li>
          <li>
            {objectEdit.source && objectEdit.target && (
              <>
                <div>
                  <input
                    className="textbox"
                    placeholder="Edges Value..."
                    value={objectEdit.label}
                    onChange={(e) => {
                      const newObjectEdit = objectEdit;
                      newObjectEdit.label = e.target.value;

                      setObjectEdit({ ...newObjectEdit });

                      const newEdges = edges.map((item) => {
                        if (item.id === objectEdit.id) {
                          const newItem = item;

                          newItem.label = e.target.value;
                          return { ...newItem };
                        }
                        return item;
                      });

                      setEdges(newEdges);
                    }}
                  />
                  <IconContext.Provider value={{ className: "react-icons" }}>
                    <VscSettings onClick={() => setLgShow(true)} />
                  </IconContext.Provider>
                </div>
              </>
            )}
          </li>
          <li></li>
        </ul>
      </div>
      <div className="dndflow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgeUpdate={onEdgeUpdate}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              deleteKeyCode={"Backspace"}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              fitView
            >
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>

          <ToastContainer />
        </ReactFlowProvider>
        <Modal
          size="sm"
          show={lgShow}
          onHide={() => setLgShow(false)}
          aria-labelledby="example-modal-sizes-title-lg"
        >
          <ModalHeader>
            {" "}
            <Modal.Title>Settings</Modal.Title>
            <a href="#">
              <GiCancel onClick={() => setLgShow(false)} />
            </a>
          </ModalHeader>
          <Modal.Body>
            <div></div>
            <div>
              <img src={require("./construction.gif")} />
            </div>
            <div>The under construction ;)</div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default MermaidFlow;
