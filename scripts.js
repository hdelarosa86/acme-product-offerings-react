/* eslint-disable react/react-in-jsx-scope */
const { render } = ReactDOM;
const { Component } = React;
const { HashRouter, Switch, Link, Route, Redirect } = ReactRouterDOM;
const app = document.querySelector('#app');

const Nav = ({ pathname, companiesLength, productsLength }) => {
  return (
    <header>
      <h1>Acme Offerings React</h1>
      <nav>
        <Link
          to="/companies"
          className={pathname === '/companies' ? 'active' : ''}
        >
          {`Companies (${companiesLength})`}
        </Link>
        <Link
          to="/products"
          className={pathname === '/products' ? 'active' : ''}
        >
          {`Products (${productsLength})`}
        </Link>
      </nav>
    </header>
  );
};

const ListComponent = ({ pathname, listData }) => {
  return (
    <ul>
      {listData.map((data, idx) => {
        return (
          <li key={idx}>
            {pathname === '/companies' && <Company company={data} />}
            {pathname === '/products' && <Product product={data} />}
          </li>
        );
      })}
    </ul>
  );
};

const Company = ({ company }) => {
  return (
    <div>
      <h2>{company.name}</h2>
      <p>{company.catchPhrase}</p>
      <ul>
        {company.product.map((product, idx) => (
          <li key={idx}>{`${product} ${company.price[idx]}`}</li>
        ))}
      </ul>
    </div>
  );
};

const Product = ({ product }) => {
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{`$${product.suggestedPrice}.00`}</p>
      <p>{product.description}</p>
      <p>Offered by:</p>
      <ul>
        {product.companyName.map((company, idx) => (
          <li key={idx}>{company}</li>
        ))}
      </ul>
    </div>
  );
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      productsAPI: [],
      companiesAPI: [],
    };
  }
  componentDidMount() {
    Promise.all([
      axios.get('https://acme-users-api-rev.herokuapp.com/api/companies'),
      axios.get('https://acme-users-api-rev.herokuapp.com/api/products'),
      axios.get('https://acme-users-api-rev.herokuapp.com/api/offerings'),
    ])
      .then((responses) => responses.map((response) => response.data))
      .then(([companies, products, offerings]) => {
        const productsAPI = createProductAPI(offerings, products, companies);
        this.setState({ productsAPI });
        const companiesAPI = createCompanyAPI(productsAPI, companies);
        this.setState({ companiesAPI });
      });
  }

  render() {
    const { companiesAPI, productsAPI } = this.state;
    return (
      <div>
        <HashRouter>
          <Route
            render={({ location }) => (
              <Nav
                companiesLength={companiesAPI.length}
                productsLength={productsAPI.length}
                pathname={location.pathname}
              />
            )}
          />
          <Switch>
            <Route
              path="/companies"
              render={({ location }) => (
                <ListComponent
                  pathname={location.pathname}
                  listData={companiesAPI}
                />
              )}
            />
            <Route
              path="/products"
              render={({ location }) => (
                <ListComponent
                  pathname={location.pathname}
                  listData={productsAPI}
                />
              )}
            />
            <Redirect to="/companies" />
          </Switch>
        </HashRouter>
      </div>
    );
  }
}

render(<App />, app);

const createProductAPI = (offerings, products, companies) => {
  let arr = [];
  products.forEach((product) => {
    let obj = {
      name: product.name,
      description: product.description,
      suggestedPrice: product.suggestedPrice,
      offerPrice: [],
      companyName: [],
    };
    offerings.forEach((offering) => {
      if (product.id === offering.productId) {
        obj.offerPrice.push(offering.price);
        companies.forEach((company) => {
          if (offering.companyId === company.id) {
            obj.companyName.push(company.name);
          }
        });
      }
    });
    arr.push(obj);
  });
  return arr;
}; //End of createProductAPI

const createCompanyAPI = (productsAPI, companies) => {
  let arr = [];
  companies.forEach((company) => {
    let obj = {
      name: company.name,
      catchPhrase: company.catchPhrase,
      product: [],
      price: [],
    };
    productsAPI.forEach((product) => {
      if (product.companyName.includes(company.name)) {
        let index = product.companyName.indexOf(company.name);
        obj.product.push(product.name);
        obj.price.push(product.offerPrice[index].toFixed(2));
      }
    });

    arr.push(obj);
  });
  return arr;
};
