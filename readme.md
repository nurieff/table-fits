# TableFits

[Full doc | Example | Demo](http://nurieff.github.io/table-fits)

[npm](https://www.npmjs.com/package/table-fits)

Responsive table into a responsive site. Or adaptive?

Easy

Support colspan

```
npm install table-fits
```

```html
<script src="js/table-fits.js"></script>
// Create own style or take ours — for test
<link rel="stylesheet" href="css/table-fits.css">
```

```html
<table id="id-table">
    <thead>
        <tr>
            <td>Title 1</td>
            <td>Title 2</td>
            ...
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Value 1</td>
            <td>Value 2</td>
            ...
        </tr>
        ...
    </tbody>
</table>
```

```javascript
TableFits.make('#id-table');
```

Now, you have the responsive table

### How it works?

The script looks for a table and if the data in the table do not fit, the script will show them in cute look

The script will keep watch, if the structure of the table has changed or added a new line. And modify data in new blocks.

And callback on resize

### Some options

```javascript
TableFits.make('#id-table',{
   mainClass: 'table-fits',
   width: null,
   resize: true,
   watch: true
})
```

Option | Description
------ | -----------
`mainClass`|Class name prefix, default: `table-fits` and all children has class `table-fits__...`
`width`|Sets the width of the table when it will converted into blocks, default `null`
`resize`|Enable resize, if width of window will change, default `true`
`watch`|Enable watch, if the structure of the table has changed or added a new line, default `true`

### Inline options

#### Skip the table `data-table-fits="no"`

If you give the script all tables in a row, this option will be useful

```html
<table id="id-table" data-table-fits="no">
...
</table>
```

#### Width of the table `data-table-width="700"`

Sets the width of the table when it will converted into blocks.

```html
<table id="id-table" data-table-width="700">
...
</table>
```

Similar to the option

```javascript
TableFits.make('#id-table',{
   width: 700
});
```

#### Title of block `data-table-fits="title"`

The block is tag `<tr>` like `<div>`, and this block may have headings (titles).
You need to add `data-table-fits="title"` in the right column in the tag `<td>` in the `<thead>`

P.S. Supports multiple headers

```html
<table id="id-table">
    <thead>
        <tr>
            <td data-table-fits="title">Title 1</td>
            <td data-table-fits="title">Title 2</td>
            <td>Title 3</td>
            ...
        </tr>
    </thead>
    <tbody>
        ...
    </tbody>
</table>
```

Now, the headers that have the option, the "headers's data" will be in the top of block like a header

#### Combine headers `data-table-fits-group="My group"`

You can combine columns using `colspan` or use the option `data-table-fits-group="My group"`

```html
<table id="id-table">
    <thead>
        <tr>
            <td data-table-fits-group="My group">Title 1</td>
            <td data-table-fits-group="My group">Title 2</td>
            <td>Title 3</td>
            ...
        </tr>
    </thead>
    <tbody>
        ...
    </tbody>
</table>
```

or

```html
<table id="id-table">
    <thead>
        <tr>
            <td colspan="2">My Group</td>
            <td rowspan="2">Title 3</td>
            ...
        </tr>
        <tr>
            <td>Title 1</td>
            <td>Title 2</td>
            <td>Title 3</td>
            ...
        </tr>
    </thead>
    <tbody>
        ...
    </tbody>
</table>
```

[Full doc | Example | Demo](http://nurieff.github.io/table-fits)