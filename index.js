const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express();

// Countries
const countries = [
    { id: 1, name: 'United States' },
    { id: 2, name: 'France' },
    { id: 3, name: 'Japan' }
];

// Cities
const cities = [
    { id: 1, name: 'New York City', countryId: 1 },
    { id: 2, name: 'Paris', countryId: 2 },
    { id: 3, name: 'Tokyo', countryId: 3 },
    { id: 4, name: 'Los Angeles', countryId: 1 },
    { id: 5, name: 'Marseille', countryId: 2 },
    { id: 6, name: 'Osaka', countryId: 3 }
];

const CityType = new GraphQLObjectType({
    name: 'City',
    description: 'This represents a city represented by a country',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        countryId: { type: GraphQLNonNull(GraphQLInt) },
        country: {
            type: CountryType,
            resolve: (city) => {
                return countries.find(country => country.id === city.countryId)
            }
        }
    })
});

CountryType = new GraphQLObjectType({
    name: 'Country',
    description: 'This represents a country of a city',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        cities: {
            type: new GraphQLList(CityType),
            resolve: (country) => {
                return cities.filter(city => city.countryId === country.id)
            }
        }
    })
});


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        city: {
            type: CityType,
            description: 'A Single City',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => cities.find(city => city.id === args.id)
        },
        cities: {
            type: new GraphQLList(CityType),
            description: 'List of All Cities',
            resolve: () => cities
        },
        country: {
            type: CountryType,
            description: 'A Single Country',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => countries.find(country => country.id === args.id)
        },
        countries: {
            type: new GraphQLList(CountryType),
            description: 'List of All Countries',
            resolve: () => countries
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addCity: {
            type: CityType,
            description: 'Add a city',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                countryId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const city = { id: cities.length + 1, name: args.name, countryId: args.countryId }
                cities.push(city)
                return city
            }
        },
        addCountries: {
            type: CountryType,
            description: 'Add a country',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const country = { id: countries.length + 1, name: args.name }
                countries.push(country)
                return country
            }
        },
        deleteCity: {
            type: CityType,
            description: 'Delete a city',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const index = cities.findIndex(city => city.id === args.id);

                if (index !== -1) {
                    const deletedCity = cities.splice(index, 1)[0];
                    return `Deleted city: ${deletedCity.name}`;
                } else {
                    throw new Error('City not found');
                }
            }
        },
        deleteCountry: {
            type: CountryType,
            description: 'Delete a country',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const index = countries.findIndex(country => country.id === args.id);

                if (index !== -1) {
                    const deletedCountry = countries.splice(index, 1)[0];
                    return `Deleted country: ${deletedCountry.name}`;
                } else {
                    throw new Error('Country not found');
                }
            }
        },
        updateCity: {
            type: CityType,
            description: 'Update a city',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) },
                countryId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const index = cities.findIndex(city => city.id === args.id);

                if (index !== -1) {
                    cities[index] = {
                        ...cities[index],
                        name: args.name,
                        countryId: args.countryId
                    };
                    return cities[index];
                } else {
                    throw new Error('City not found');
                }
            }
        },

        updateCountry: {
            type: CountryType,
            description: 'Update a country',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const index = countries.findIndex(country => country.id === args.id);

                if (index !== -1) {
                    countries[index] = {
                        ...countries[index],
                        name: args.name
                    };
                    return countries[index];
                } else {
                    throw new Error('Country not found');
                }
            }
        }
    })
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(5000, () => console.log('Server Running'));
