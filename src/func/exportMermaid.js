export default function  exportMermaid(n,e) {
    let a = "graph TD";
    n.forEach(element => {
      let id = element.id;
      let inf = element.data.label;
      a+=(`\n A${id.toUpperCase()}[${inf}]`);
    });
    e.forEach(element => {
      let s = element.source;
      let t = element.target;
      let i = element.label ? `|${element.label}|` : '';
      a+=(`\n A${s.toUpperCase()}-->${i}A${t.toUpperCase()}`);
    });
    navigator.clipboard.writeText(a);
    
  }
