const { render } = ReactDOM;
const { Component } = React;
const app = document.querySelector('#app');
const { HashRouter, Switch, Link, Route, Redirect } = ReactRouterDOM;

const Companies = () => <h1>Companies</h1>;
const Products = () => <h1>Products</h1>;

const Nav = props => {
  const path = props.location.pathname;
  return (
    <nav>
      <Link to="/companies">Companies</Link>
      <Link to="/products">Products</Link>
    </nav>
  );
};

const Navigation = () => {
  return (
    <HashRouter>
      <Route component={Nav} />
      <Switch>
        <Route path="/companies" component={Companies} />
        <Route path="/products" component={Products} />
        <Redirect to="/companies" />
      </Switch>
    </HashRouter>
  );
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      productsAPI: [],
      companies: [],
      view: 'companies',
    };
  }
  componentDidMount() {
    window.addEventListener('hashchange', () => {
      const view = window.location.hash.slice(1);
      this.setState({ view });
    });
    if (window.location.hash.slice(1)) {
      const view = window.location.hash.slice(1);
      this.setState({ view });
    }

    Promise.all([
      axios.get('https://acme-users-api-rev.herokuapp.com/api/companies'),
      axios.get('https://acme-users-api-rev.herokuapp.com/api/products'),
      axios.get('https://acme-users-api-rev.herokuapp.com/api/offerings'),
    ])
      .then(responses => responses.map(response => response.data))
      .then(([companies, products, offerings]) => {
        const productsAPI = createProductAPI(offerings, products, companies);
        this.setState({ productsAPI });

        const companyAPI = createCompanyAPI(productsAPI, companies);
        console.log(companyAPI);
      });
  }

  render() {
    return (
      <div>
        <Navigation />
        <ul>
          {this.state.productsAPI.map((product, idx) => {
            const ProductName = () => product.name;
            const SuggestedPrice = () => <p>{product.suggestedPrice}</p>;
            const Description = () => <p>{product.description}</p>;
            const OfferedBy = () => (
              <ul>
                {product.companyName.map(company => {
                  return <li>{company}</li>;
                })}
              </ul>
            );

            return (
              <li key={idx}>
                <ProductName />
                <div>
                  <SuggestedPrice />
                  <Description />
                  <OfferedBy />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

render(<App />, app);


const createProductAPI = (offerings, products, companies) => {
  let arr = [];
  products.forEach(product => {
    let obj = {
      name: product.name,
      description: product.description,
      suggestedPrice: product.suggestedPrice,
      offerPrice: [],
      companyName: [],
    };
    offerings.forEach(offering => {
      if (product.id === offering.productId) {
        obj.offerPrice.push(offering.price);
        companies.forEach(company => {
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
  companies.forEach(company => {
    let obj = {
      name: company.name,
      catchPhrase: company.catchPhrase,
      product: [],
      price: [],
    };
    productsAPI.forEach(product => {
      if (product.companyName.includes(company.name)) {
        console.log(company.name);
        let index = product.companyName.indexOf(company.name);
        obj.product.push(product.name);
        obj.price.push(product.offerPrice[index].toFixed(2));
      }
    });

    arr.push(obj);
  });
  return arr;
};
