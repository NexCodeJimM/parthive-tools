import React from "react";

interface CompatibilityRow {
  make: string;
  model: string;
  year: string;
  ccm: string;
  submodels: string;
  streetname: string;
}

interface Product {
  productTitle: string;
  productOverview: string;
  keyFeatures: string[];
  perfectFor: string[];
  compatibilityTable: CompatibilityRow[];
}

const HTMLSnippet: React.FC<{ product: Product }> = ({ product }) => {
  const {
    productTitle,
    productOverview,
    keyFeatures,
    perfectFor,
    compatibilityTable,
  } = product;

  const generateTableRows = () => {
    return compatibilityTable.map((entry, index) => (
      <tr key={index}>
        <td>{entry.make}</td>
        <td>{entry.model}</td>
        <td>{entry.year}</td>
        <td>{entry.ccm}</td>
        <td>{entry.submodels}</td>
        <td>{entry.streetname}</td>
      </tr>
    ));
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{productTitle}</title>
      <meta name="description" content={productOverview} />
      <meta name="keywords" content={productTitle} />
      <h1>{productTitle}</h1>

      <h2>Product Overview</h2>
      <p>{productOverview}</p>

      <h3>Key Features</h3>
      <ul>
        {keyFeatures.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>

      <h3>Perfect For</h3>
      <ul>
        {perfectFor.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h3>Compatibility Table</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Make
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Model
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Year
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              CCM
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Submodels
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              StreetName
            </th>
          </tr>
        </thead>
        <tbody>{generateTableRows()}</tbody>
      </table>
    </div>
  );
};

export default HTMLSnippet;
