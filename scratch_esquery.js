import { parse } from 'acorn';
import { query } from 'esquery';

const code = `
  const [a, setA] = useState(1);
  const [b, setB] = useState(props.b);
  const [c, setC] = useState(someVar);
  const [d, setD] = useState();
`;
const ast = parse(code, { ecmaVersion: 2020 });
const matches = query(ast, "CallExpression[callee.name='useState'][arguments.0.type='Identifier']");
console.log("Identifiers:", matches.length);
const matches2 = query(ast, "CallExpression[callee.name='useState'][arguments.0.type='MemberExpression']");
console.log("MemberExpressions:", matches2.length);
