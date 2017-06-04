# TableFits

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

### Any options

```javascript
TableFits.make('#id-table',{
   mainClass: 'table-fits',
   resize: true,
   watch: true
})
```

Option | Description
------ | -----------
`mainClass`|Class name prefix, default: `table-fits` and all children has class `table-fits__...`
`resize`|Enable resize, if width of window will change, default `true`
`watch`|Enable watch, if the structure of the table has changed or added a new line, default `true`

### Inline options

#### Skip the table `data-table-fits="no"`
```html
<table id="id-table" data-table-fits="no">
...
</table>
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

You can combine columns without the use `colspan` and instead use the option `data-table-fits-group="My group"`
